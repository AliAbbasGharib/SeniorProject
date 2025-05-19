// Example middleware for authorization
// filepath: c:\Users\USER\Desktop\SeniorProject\back-end\middleware\authRequestBlood.js
const RequestBlood = require('../Models/RequestBlood');

async function canEditOrDeleteRequest(req, res, next) {
    const requestId = req.params.id;
    const user = req.user; // assuming req.user is set by authentication middleware

    const request = await RequestBlood.findById(requestId);
    if (!request) {
        return res.status(404).json({ message: 'Request not found' });
    }

    // Allow if user is owner, admin, or hospital
    if (
        request.user_id.equals(user._id) ||
        user.role === '1995' ||
        user.role === '1996'
    ) {
        return next();
    }

    return res.status(403).json({ message: 'Not authorized' });
}

module.exports = canEditOrDeleteRequest;