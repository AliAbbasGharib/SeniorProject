const Contact = require('../../Models/Contact');


exports.submitContact = async (req, res) => {
    try {
        const { name, phone_number, message } = req.body;

        const userId = req.user?.id || null; // If using JWT middleware

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // If not authenticated, require name and phone_number
        if (!userId && (!name || !phone_number)) {
            return res.status(400).json({ message: "Name and phone number are required for guest users" });
        }

        const contact = await Contact.create({
            user_id: userId,
            name,
            phone_number,
            message
        });

        res.status(200).json({ contact });

    } catch (error) {
        console.error("Contact submission error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMessage = async (req, res) => {
    try {
        const messages = await Contact.find();
        res.status(200).json({
            messages: messages
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

exports.deleteMessage = async (req, res) => {
    try {
        const message = await Contact.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateMessageStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["unread", "read", "responded"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.status(200).json({ message });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};