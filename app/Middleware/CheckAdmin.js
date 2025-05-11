const CheckAdmin = (req, res, next) => {
    if (req.user && req.user.role === '1995') {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: Admins only' });
};

module.exports = CheckAdmin;
