const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../Models/Users');
const Token = require('../Models/Token ');

// JWT Token creator
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '180d'
    });
};

// ✅ Register user & send email
exports.register = async (req, res) => {
    try {
        const {
            name, email, password, phone_number, date_of_birth,
            gender, blood_type, address, last_donation_date, location, role
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

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
            role: role || '2001',
        });

        await newUser.save();

        const verificationToken = new Token({
            userId: newUser._id,
            token: crypto.randomBytes(32).toString("hex"),
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        });

        await verificationToken.save();

        const verificationUrl = `${process.env.BASE_URL}/${newUser._id}/verify/${verificationToken.token}`;

        const emailContent = `
      <h2>Hello ${newUser.name}!</h2>
      <p>Click below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

        await SendEmail(email, "Verify Your Email", emailContent);

        return res.status(201).json({
            message: 'Registration successful! Please verify your email.',
            user: { id: newUser._id, email: newUser.email, verified: newUser.verified }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};

// ✅ Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { id, token } = req.params;
        const user = await User.findById(id);
        if (!user) return res.send("<h2>User not found</h2>");

        if (user.verified) {
            return res.send(`<h2>Email already verified</h2><a href="${process.env.FRONTEND_URL}/login">Go to login</a>`);
        }

        const verificationToken = await Token.findOne({ userId: id, token });
        if (!verificationToken) return res.send("<h2>Invalid or expired verification link</h2>");

        user.verified = true;
        user.status = 'active';
        await user.save();
        await Token.deleteMany({ userId: id });

        res.send(`<h2>Email verified successfully!</h2><a href="${process.env.FRONTEND_URL}/login">Go to login</a>`);
    } catch (err) {
        console.error('Verification error:', err);
        res.status(500).send("<h2>Verification failed. Please try again.</h2>");
    }
};

// ✅ Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        if (!user.verified) {
            return res.status(403).json({ message: "Email not verified. Check your inbox." });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ message: "Account not active. Contact support." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = createToken(user._id);
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            message: "Login successful",
            token,
            user: userObj
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: "Login failed" });
    }
};

// ✅ Resend Verification Email
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.verified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        await Token.deleteMany({ userId: user._id });

        const newToken = new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        await newToken.save();

        const verificationUrl = `${process.env.BASE_URL}/${user._id}/verify/${newToken.token}`;
        const emailContent = `
      <h2>Hello ${user.name},</h2>
      <p>Click below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `;

        await SendEmail(email, "Verify Your Email", emailContent);

        res.status(200).json({ message: "Verification email sent again." });
    } catch (err) {
        console.error('Resend verification error:', err);
        res.status(500).json({ message: "Could not resend verification email." });
    }
};

// ✅ Logout
exports.logout = (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
};
