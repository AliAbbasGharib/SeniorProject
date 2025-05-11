const jwt = require('jsonwebtoken');
const User = require('../../Models/Users');

const AuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: You do not have permission to access this resource' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, 'process.env.JWT_SECRET'); // Use env in real apps
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = AuthMiddleware;
