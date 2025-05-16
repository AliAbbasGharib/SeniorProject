const RequestBlood = require('../../Models/RequestBlood');


//get specific request
exports.getSpecificRequest = async (req, res) => {
  try {
    const request = await RequestBlood.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({
      status: 200,
      message: 'Request found',
      request,
    });
  } catch (err) {
    console.error('Get specific request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

//get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await RequestBlood.find();
    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: 'No requests found' });
    }
    res.status(200).json({
      status: 200,
      message: 'Requests found',
      requests,
    });
  } catch (err) {
    console.error('Get all requests error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// get limited number of requests
exports.getLimitedRequests = async (req, res) => {
  try {
    const limit = parseInt(req.params.number);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ message: 'Invalid limit number' });
    }

    const requests = await RequestBlood.find().limit(limit);
    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: 'No requests found' });
    }

    res.status(200).json({
      status: 200,
      message: `Returning ${requests.length} request(s)`,
      requests,
    });
  } catch (err) {
    console.error('Get limited requests error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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

  if (!user_id || !blood_type || !quantity || !donation_point || !contact_number || !urgency) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  try {
    const request = new RequestBlood({
      user_id,
      patient_name,
      blood_type,
      quantity,
      donation_point,
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

// uodate request
exports.updateRequest = async (req, res) => {
  const {
    user_id,
    patient_name,
    blood_type,
    quantity,
    donation_point,
    contact_number,
    description,
    trasportation,
    request_date,
    urgency,
    status,
  } = req.body;

  try {
    const request = await RequestBlood.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.user_id = user_id || request.user_id;
    request.patient_name = patient_name || request.patient_name;
    request.blood_type = blood_type || request.blood_type;
    request.quantity = quantity || request.quantity;
    request.donation_point = donation_point || request.donation_point;
    request.contact_number = contact_number || request.contact_number;
    request.description = description || request.description;
    request.trasportation = trasportation || request.trasportation;
    request.request_date = request_date || request.request_date;
    request.urgency = urgency || request.urgency;
    request.status = status || request.status;


    await request.save();

    res.status(200).json({
      status: 200,
      message: 'Request updated',
      request,
    });
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await RequestBlood.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await request.remove();

    res.status(200).json({
      status: 200,
      message: 'Request deleted',
    });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};