exports.addRequest = async (req, res) => {
    const {
        user_id,
        blood_type,
        quantity,
        hospital_name,
        hospital_address,
        contact_number,
        urgency,
    } = req.body;

    if (!user_id || !blood_type || !quantity || !hospital_name || !hospital_address || !contact_number || !urgency) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    try {
        const request = new RequestBlood({
            user_id,
            blood_type,
            quantity,
            hospital_name,
            hospital_address,
            contact_number,
            urgency,
            status: "pending",
        });

        await request.save();

        res.status(200).json({
            status: 200,
            message: 'Request Created',
            request,
        });
    } catch (err) {
        console.error('Add request error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
