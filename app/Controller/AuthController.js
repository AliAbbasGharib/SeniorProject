const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require("../../Models/Users");
const Token = require("../../Models/Token ");
const SendEmail = require("../../utils/SendEmail");
const crypto = require('crypto');

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '180d'
    });
};

// Register 
module.exports.register = async (req, res) => {
    try {
        const {
            name, email, password, phone_number, date_of_birth,
            gender, blood_type, address, last_donation_date,
            location, role
        } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "This Email Already Exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone_number,
            date_of_birth,
            gender,
            blood_type,
            address,
            last_donation_date,
            location,
            role: role || 2001,
            verified: false,
            status: 'active'
        });

        await newUser.save();

        // Create verification token
        const verificationToken = new Token({
            userId: newUser._id,
            token: crypto.randomBytes(32).toString("hex"),
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours expiry
        });

        await verificationToken.save();

        // Create verification URL
        const verificationUrl = `${process.env.BASE_URL}/api/auth/${newUser._id}/verify/${verificationToken.token}`;

        // Email content
        const emailSubject = "Verify Your Email Address";
        const emailContent = `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #333; text-align: center;">Welcome ${name}!</h2>
                <p>Thank you for registering with us. Please click the link below to verify your email and activate your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #28a745; color: white; padding: 15px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
                        ✓ Verify My Email
                    </a>
                </div>
                <p style="color: #666; font-size: 14px; text-align: center;">
                    Or copy and paste this link: <br>
                    <a href="${verificationUrl}" style="color: #007bff;">${verificationUrl}</a>
                </p>
                <p style="color: #999; font-size: 12px; text-align: center;">
                    This link will expire in 24 hours.
                </p>
            </div>
        `;

        await SendEmail(newUser.email, emailSubject, emailContent);

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                verified: newUser.verified
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            message: "Registration failed. Please try again.",
            error: err.message,
            stack: err.stack
        });
    }
};

// Login 
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // if (!user.verified) {
        //     return res.status(403).json({
        //         message: 'Please verify your email before logging in. Check your inbox for verification link.'
        //     });
        // }

        if (user.status !== 'active') {
            return res.status(403).json({
                message: 'Your account is not active. Please contact support.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = createToken(user._id);

        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        return res.status(200).json({
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            message: "Login failed. Please try again.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Email Verification
module.exports.verifyEmail = async (req, res) => {
    try {
        const { id, token } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #dc3545;">❌ Verification Failed</h2>
                        <p>User not found. Please try registering again.</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/register" 
                           style="background-color: #007bff; color: white; padding: 10px 20px; 
                                  text-decoration: none; border-radius: 5px;">
                            Register Again
                        </a>
                    </body>
                </html>
            `);
        }

        if (user.verified) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #28a745;">✅ Already Verified!</h2>
                        <p>Your email is already verified. You can log in to your account.</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                           style="background-color: #28a745; color: white; padding: 10px 20px; 
                                  text-decoration: none; border-radius: 5px;">
                            Go to Login
                        </a>
                    </body>
                </html>
            `);
        }

        const verificationToken = await Token.findOne({
            userId: user._id,
            token: token
        });

        if (!verificationToken) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #dc3545;">❌ Invalid Link</h2>
                        <p>This verification link is invalid or has expired.</p>
                        <p>Please request a new verification email.</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/resend-verification" 
                           style="background-color: #ffc107; color: black; padding: 10px 20px; 
                                  text-decoration: none; border-radius: 5px;">
                            Resend Verification
                        </a>
                    </body>
                </html>
            `);
        }

        await User.updateOne(
            { _id: user._id },
            {
                verified: true,
                status: 'active'
            }
        );

        await verificationToken.deleteOne();

        res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: #28a745;">🎉 Email Verified Successfully!</h2>
                    <p>Welcome <strong>${user.name}</strong>! Your account is now active.</p>
                    <p>You can now log in and start using your account.</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                       style="background-color: #28a745; color: white; padding: 15px 30px; 
                              text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Go to Login
                    </a>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('Email verification error:', error);
        res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: #dc3545;">❌ Something went wrong</h2>
                    <p>Please try again or contact support.</p>
                </body>
            </html>
        `);
    }
};

// Resend Verification Email
module.exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.verified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        await Token.deleteMany({ userId: user._id });

        const verificationToken = new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        await verificationToken.save();

        const verificationUrl = `${process.env.BASE_URL}/api/auth/${user._id}/verify/${verificationToken.token}`;

        const emailContent = `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">Email Verification</h2>
                <p>Please click the link below to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
            </div>
        `;

        await SendEmail(user.email, "Verify Your Email Address", emailContent);

        res.status(200).json({
            message: "Verification email sent. Please check your inbox."
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            message: "Failed to resend verification email. Please try again."
        });
    }
};

// Logout
module.exports.logout = (req, res) => {
    return res.status(200).json({
        message: 'Logged out successfully'
    });
};