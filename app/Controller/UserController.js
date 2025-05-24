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

exports.getLimitedUsers = async (req, res) => {
    try {
        const limit = parseInt(req.params.number);
        if (isNaN(limit) || limit <= 0) {
            return res.status(400).json({ message: 'Invalid limit number' });
        }

        const requests = await User.find().limit(limit);
        if (!requests || requests.length === 0) {
            return res.status(404).json({ message: 'No User found' });
        }

        res.status(200).json({
            status: 200,
            message: `Returning ${requests.length} request(s)`,
            requests,
        });
    } catch (err) {
        console.error('Get limited users error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
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
    const { name, email, password, phone_number, date_of_birth, gender, blood_type, donation_availability,
        address, last_donation_date, location,
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
            donation_availability,
            address,
            last_donation_date,
            location,
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
        donation_availability,
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
        user.donation_availability = donation_availability;
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
// UserController.js
exports.updateOwnProfile = async (req, res) => {
    const {
        name,
        email,
        phone_number,
        date_of_birth,
        gender,
        blood_type,
        address,
        last_donation_date
    } = req.body;

    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone_number = phone_number || user.phone_number;
        user.date_of_birth = date_of_birth || user.date_of_birth;
        user.gender = gender || user.gender;
        user.blood_type = blood_type || user.blood_type;
        user.address = address || user.address;
        user.last_donation_date = last_donation_date || user.last_donation_date;

        await user.save();

        res.status(200).json({
            status: 200,
            message: 'Your profile has been updated',
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



// status user
exports.statusUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ['active', 'inactive', 'pending', 'banned'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = status;
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'User status updated successfully',
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.ChangePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Get donors available to donate (last donation > 3 months ago)
exports.getAvailableDonors = async (req, res) => {
    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const users = await User.find({
            role: '2001',  // make sure this matches your user roles
            donation_availability: "available",
            $or: [
                { last_donation_date: { $lte: threeMonthsAgo } },
                { last_donation_date: { $exists: false } },
                { last_donation_date: null }
            ]
        });
        res.status(200).json({
            status: 200,
            message: `Found ${users.length} available donor(s)`,
            users
        });
    } catch (err) {
        console.error('Error fetching available donors:', err.stack || err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.countDonorsByBloodType = async (req, res) => {
    try {

        const counts = await User.aggregate([
            {
                $group: {
                    _id: "$blood_type",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert array to object: { A+: 10, B-: 5, ... }
        const result = {};
        counts.forEach(item => {
            result[item._id] = item.count;
        });

        res.status(200).json({
            status: 200,
            message: "Donor count by blood type",
            data: result
        });
    } catch (err) {
        console.error("Error counting donors by blood type:", err.stack || err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


