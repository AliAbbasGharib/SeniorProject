const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require("../../Models/Users");
const Token = require("../../Models/Token ");
const SendEmail = require("../../utils/SendEmail");
const crypto = require('crypto');

const createToken = (id) => {
    return jwt.sign({ id }, "process.env.JWT_SECRET", {
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
        const verificationUrl = `${process.env.BASE_URL}/${newUser._id}/verify/${verificationToken.token}`;

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

        if (!user.verified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in. Check your inbox for verification link.'
            });
        }

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

        // const userResponse = { ...user.toObject() };
        // delete userResponse.password;

        return res.status(200).json({
            message: "Login successful",
            token,
            user
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            message: "Login failed. Please try again.",
        });
    }
};

// Email Verification
module.exports.verifyEmail = async (req, res) => {
    try {
        const { id, token } = req.params;

        const user = await User.findById(id);
        if (!user) return res.status(400).send("Invalid link");

        const verificationToken = await Token.findOne({ userId: id, token });
        if (!verificationToken) return res.status(400).send("Invalid or expired link");

        // Mark user as verified
        user.verified = true;
        await user.save();

        // Remove token
        await verificationToken.deleteOne();

        // ✅ Create JWT token
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '180d'
        });

        // ✅ Redirect to frontend with token
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-success?token=${jwtToken}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong");
    }
};


// Logout
module.exports.logout = (req, res) => {
    return res.status(200).json({
        message: 'Logged out successfully'
    });
};