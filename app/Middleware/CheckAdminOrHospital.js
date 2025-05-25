module.exports = function (req, res, next) {
    const user = req.user;

    if (user && (user.role === '1995' || user.role === '1996')) {
        return next();
    }

    return res.status(403).json({ message: 'Access denied: Admin or Hospital only' });
};