// controllers/NotificationController.js
const Notification = require("../../Models/Notification");
const User = require("../../Models/Users");

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


exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await Notification.find({ user_id: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Notifications retrieved successfully",
            notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await Notification.countDocuments({
            user_id: userId,
            isRead: false
        });

        res.status(200).json({ unreadCount: count });
    } catch (error) {
        console.error("Error getting unread count:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.updateMany(
            { user_id: userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ message: "Server error" });
    }
};
