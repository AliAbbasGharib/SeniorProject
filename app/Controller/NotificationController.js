// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const Notification = require("../../Models/Notification");
const User = require("../../Models/Users");

// Send notification to all registered users
exports.sendNotificationToAllUsers = async (req, res) => {
    try {
        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required" });
        }

        // Get all active users with Expo tokens
        const users = await User.find({ status: "active" });

        // Create notification documents
        const notifications = users.map(user => ({
            user_id: user._id,
            title,
            body,
            data: { type: 'general' },
        }));

        await Notification.insertMany(notifications);

        res.status(200).json({ message: `Notifications stored and push sent to ${users.length} users.` });
    } catch (error) {
        console.error("Error sending notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getSpecificNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        res.status(200).json({
            status: 200,
            message: 'User',
            data: notification
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;  // Ensure req.user is set by Auth middleware

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }

        const notifications = await Notification.find({ user_id: userId })
            .sort({ createdAt: -1 });

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

exports.updateNotifications = async (req, res) => {
    const { title, body } = req.body;
    const { id } = req.params;

    try {
        // Validate input (basic check)
        if (!title || !body) {
            return res.status(400).json({ status: 400, message: 'Title and body are required' });
        }

        // Find notification by ID
        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ status: 404, message: 'Notification not found' });
        }

        // Update fields
        notification.title = title;
        notification.body = body;

        // Save changes
        await notification.save();

        res.status(200).json({
            status: 200,
            message: 'Notification updated successfully',
            data: notification,
        });
    } catch (err) {
        console.error('Update Notification Error:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
        });
    }
};


exports.deleteNotifications = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ status: 200, message: 'Notification Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getUndeliveredNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const undeliveredNotifications = await Notification.find({
            user_id: userId,
            isDelivered: false
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Undelivered notifications retrieved successfully",
            notifications: undeliveredNotifications
        });
    } catch (error) {
        console.error("Error fetching undelivered notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.markAllAsDelivered = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await Notification.updateMany(
            { user_id: userId, isDelivered: false },
            { $set: { isDelivered: true } }
        );

        res.status(200).json({ message: `${result.modifiedCount} notifications marked as delivered` });
    } catch (error) {
        console.error("Error updating delivery status:", error);
        res.status(500).json({ message: "Server error" });
    }
};


