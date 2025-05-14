const User = require('../../Models/Users');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get authenticated user
exports.userAuth = async (req, res) => {
    res.status(200).json(req.user); // req.user is set in auth middleware
};

// Get specific user
exports.getSpecificUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            status: 200,
            message: 'User',
            data: user
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Add new user
exports.addUser = async (req, res) => {
    const { name, email, password, phone_number, date_of_birth, gender, blood_type,
        address, last_donation_date,
        role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone_number,
            date_of_birth,
            gender,
            blood_type,
            address,
            last_donation_date,
            role,
        });
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'User Created',
            user
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    const {
        name,
        email,
        password,
        phone_number,
        date_of_birth,
        gender,
        blood_type,
        address,
        last_donation_date,
        role
    } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name;
        user.email = email;
        user.phone_number = phone_number;
        if (password) user.password = await bcrypt.hash(password, 10);
        user.role = role;
        user.date_of_birth = date_of_birth;
        user.blood_type = blood_type;
        user.gender = gender;
        user.address = address;
        user.last_donation_date = last_donation_date;

        await user.save();

        res.status(200).json({
            status: 200,
            message: 'User Updated',
            user
        });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ status: 200, message: 'User Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
