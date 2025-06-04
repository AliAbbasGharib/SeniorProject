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

        await Contact.create({
            user_id: userId,
            name,
            phone_number,
            message
        });

        res.status(200).json({ message: "Message received successfully" });

    } catch (error) {
        console.error("Contact submission error:", error);
        res.status(500).json({ message: "Server error" });
    }
};