module.exports = function (req, res, next) {
    const user = req.user;

    if (user && (user.role === 'admin' || user.role === 'hospital')) {
        return next();
    }

    return res.status(403).json({ message: 'Access denied: Admin or Hospital only' });
};