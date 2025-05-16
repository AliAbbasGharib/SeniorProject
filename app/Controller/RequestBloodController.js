const RequestBlood = require('../../Models/RequestBlood');
exports.addRequest = async (req, res) => {
  const {
    patient_name,
    blood_type,
    quantity,
    donation_point,
    contact_number,
    description,
    trasportation,
    urgency,
  } = req.body;

  const user_id = req.user._id || req.userId;  // depending on your auth middleware

  if (!user_id || !blood_type || !quantity || !donation_point|| !contact_number || !urgency) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  try {
    const request = new RequestBlood({
      user_id,
      patient_name,
      blood_type,
      quantity,
      donation_point,
      hospital_address,
      contact_number,
      description,
      trasportation,
      request_date,
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
