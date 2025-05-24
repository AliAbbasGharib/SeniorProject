const RequestBlood = require('../../Models/RequestBlood');
const User = require("../../Models/Users");
const admin = require("firebase-admin");
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
    const requests = await RequestBlood.find().sort({ createdAt: -1 });
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

    const requests = await RequestBlood.find().limit(limit).sort({ createdAt: -1 });
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


async function sendNotificationToUsers(users, message) {
  for (const user of users) {
    const usersInArea = await User.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [donation_point_lng, donation_point_lat],
          },
          $maxDistance: 15000,
        },
      },
      blood_type,
    });

    const tokens = usersInArea.flatMap(user => user.fcmTokens || []);

    if (tokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title: "Urgent Blood Request",
          body: `Someone nearby needs ${blood_type} blood.`,
        },
      });
    }
  }
}

exports.addRequest = async (req, res) => {
  const {
    patient_name,
    blood_type,
    quantity,
    donation_point,
    donation_point_lat,
    donation_point_lng,
    location, // expected GeoJSON: { type: "Point", coordinates: [lng, lat] }
    contact_number,
    request_date,
    description,
    transportation,
    urgency,
  } = req.body;

  const user_id = req.user?._id || req.userId;

  // Validate required fields
  if (
    !user_id ||
    !blood_type ||
    !quantity ||
    !donation_point ||
    !contact_number ||
    !urgency ||
    donation_point_lat === undefined ||
    donation_point_lng === undefined ||
    !location ||
    !location.type ||
    !location.coordinates ||
    location.coordinates.length !== 2
  ) {
    return res.status(400).json({ message: 'All required fields must be provided including valid location.' });
  }

  try {
    // Create new blood request
    const request = new RequestBlood({
      user_id,
      patient_name,
      blood_type,
      quantity,
      donation_point,
      donation_point_lat,
      donation_point_lng,
      location,
      contact_number,
      description,
      transportation,
      request_date,
      urgency,
      done_status: "non complete",
    });

    await request.save();

    // Find users within 15 km radius of the request location
    const usersInRange = await User.find({
      location: {
        $nearSphere: {
          $geometry: location,
          $maxDistance: 15000, // 15,000 meters = 15 km
        },
      },
      blood_type: blood_type, // optional: notify only users with matching blood type
      status: "active", // optional: only active users
    });

    // Send notification to each user found
    await sendNotificationToUsers(usersInRange, `New blood request for ${blood_type} near your area.`);

    res.status(200).json({
      status: 200,
      message: 'Request Created and notifications sent',
      request,
      notifiedUsersCount: usersInRange.length,
    });
  } catch (err) {
    console.error('Add request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// update request
exports.updateRequest = async (req, res) => {
  const {
    user_id,
    patient_name,
    blood_type,
    quantity,
    donation_point,
    donation_point_lat,
    donation_point_lng,
    location,
    contact_number,
    description,
    transportation,
    request_date,
    urgency,
    done_status,
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
    request.donation_point_lat = donation_point_lat || request.donation_point_lat;
    request.donation_point_lng = donation_point_lng || request.donation_point_lng;

    // Update location if coordinates are provided
    if (location && location.type === 'Point' && Array.isArray(location.coordinates)) {
      request.location = location;
    }

    request.contact_number = contact_number || request.contact_number;
    request.description = description || request.description;
    request.transportation = transportation || request.transportation;
    request.request_date = request_date || request.request_date;
    request.urgency = urgency || request.urgency;
    request.done_status = done_status || request.done_status;

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
    const user = await RequestBlood.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Request not found' });

    res.status(200).json({ status: 200, message: 'Request Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDoneStatus = async (req, res) => {
  const requestId = req.params.id;
  const { done_status } = req.body;

  if (!["complete", "non complete"].includes(done_status)) {
    return res.status(400).json({ message: 'Invalid done_status value' });
  }

  const request = await RequestBlood.findByIdAndUpdate(
    requestId,
    { done_status },
    { new: true }
  );

  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  res.json(request);
}