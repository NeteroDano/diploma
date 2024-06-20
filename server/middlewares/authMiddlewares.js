const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'your_secret_key');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
}

function authorizeRole(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access forbidden' });
        }
        next();
    };
}

function validateId(req, res, next) {
    const userId = req.user.id;
    if (!Number.isInteger(parseInt(userId))) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    next();
}

module.exports = { authenticateToken, authorizeRole, validateId };
