const User = require('../../Models/Users');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        const count = await User.countDocuments();
        res.status(200).json({
            totalUsers: count,
            users: users,
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
};


// Get authenticated user
exports.userAuth = async (req, res) => {
    res.status(200).json(req.user); // req.user is set in auth middleware
};

exports.getPaginatedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (limit <= 0 || page <= 0) {
            return res.status(400).json({ message: 'Invalid page or limit value' });
        }

        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};

        if (req.query.name) {
            filter.name = { $regex: req.query.name, $options: "i" }; // case-insensitive partial match
        }

        if (req.query.blood_type) {
            filter.blood_type = req.query.blood_type; // exact match
        }

        if (req.query.address) {
            filter.address = { $regex: req.query.address, $options: "i" }; // case-insensitive partial match
        }

        // Query with filter + pagination
        const users = await User.find(filter).skip(skip).limit(limit);

        // Count total filtered users
        const total = await User.countDocuments(filter);

        res.status(200).json({
            status: 200,
            message: `Page ${page} of users`,
            users,
            totalUsers: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (err) {
        console.error('Get paginated users error:', err);
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
            verified: true,
            role,
        });
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'User Created',
            user
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
        res.status(500).json({ message: err.message });
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
        res.status(500).json({ message: err.message });
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

        // Parse page and limit from query params, with defaults
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const filter = {
            role: '2001',
            donation_availability: "available",
            $or: [
                { last_donation_date: { $lte: threeMonthsAgo } },
                { last_donation_date: { $exists: false } },
                { last_donation_date: null }
            ]
        };

        // Get total count first
        const count = await User.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);

        // Get paginated users
        const users = await User.find(filter)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            status: 200,
            count,
            totalPages,
            currentPage: page,
            users,
            message: `Found ${count} available donor(s)`,
        });
    } catch (err) {
        console.error('Error fetching available donors:', err.stack || err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};




exports.countAllBloodTypes = async (req, res) => {
    try {
        const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const data = {};

        await Promise.all(
            bloodTypes.map(async (type) => {
                const totalCount = await User.countDocuments({
                    blood_type: type,
                    role: '2001'
                });

                const availableCount = await User.countDocuments({
                    blood_type: type,
                    role: "2001",
                    donation_availability: "available",
                    $or: [
                        { last_donation_date: { $lte: threeMonthsAgo } },
                        { last_donation_date: { $exists: false } },
                        { last_donation_date: null },
                    ],
                });

                data[type] = {
                    total: totalCount,
                    available: availableCount,
                };
            })
        );

        res.status(200).json({
            status: 200,
            message: "Donor counts by blood type (total and available)",
            data,
        });
    } catch (err) {
        console.error("❌ Error:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
