const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'taskflow-development-secret'
        );
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ message: 'User no longer exists' });
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Your session is invalid or has expired' });
    }
};

module.exports = { protect };
