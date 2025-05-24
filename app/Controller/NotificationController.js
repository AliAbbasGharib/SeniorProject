// controllers/NotificationController.js
const Notification = require("../models/Notification");

// Get all notifications for a user (latest first)
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user?._id || req.userId;

        const notifications = await Notification.find({ user_id: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({ status: 200, notifications });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ status: 200, message: "Marked as read", notification });
    } catch (err) {
        console.error("Error marking as read:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;

        const deleted = await Notification.findByIdAndDelete(notificationId);

        if (!deleted) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ status: 200, message: "Notification deleted" });
    } catch (err) {
        console.error("Error deleting notification:", err);
        res.status(500).json({ message: "Server error" });
    }
};
