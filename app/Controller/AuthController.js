const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require("../../Models/Users");

const createToken = (id) => {
    return jwt.sign({ id }, "process.env.JWT_SECRET", {
        expiresIn: '180d'
    });
};

// register 
module.exports.register = async (req, res) => {
    try {
        const { name, email, password, phone_number, date_of_birth, gender, blood_type,
            address, last_donation_date,location,
            role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "This Email Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone_number,
            date_of_birth,
            gender,
            blood_type,
            donation_availability,
            address,
            last_donation_date,
            location,
            role: role || 2001, // Default role if not provided
        });

        await newUser.save();

        const token = createToken(newUser._id);

        res.status(201).json({
            user: newUser,
            token,
            message: 'User registered successfully'
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// Login 
module.exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Your account is not active' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = createToken(user._id);
        return res.status(200).json({
            user,
            token,
            message: "Login successful"
        });

    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};


// logout
module.exports.logout = (req, res) => {
    return res.status(200).json({ message: 'Logged out successfully' });
};