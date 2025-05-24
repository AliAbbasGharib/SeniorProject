// controllers/NotificationController.js
const Notification = require("../models/Notification");
const User = require("../models/User");

// Send notification to all registered users
exports.sendNotificationToAllUsers = async (req, res) => {
    try {
        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required" });
        }

        // Get all active users
        const users = await User.find({ status: "active" });

        // Prepare notification documents for bulk insert
        const notifications = users.map(user => ({
            user_id: user._id,
            title,
            body,
        }));

        // Insert all notifications at once
        await Notification.insertMany(notifications);

        // Optionally: You can also trigger push notifications here (if you have device tokens)

        res.status(200).json({ message: `Notifications sent to ${users.length} users.` });
    } catch (error) {
        console.error("Error sending notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};
