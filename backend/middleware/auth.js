const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret key for JWT - in production, this should be in an environment variable
const JWT_SECRET = 'cpp-analyzer-secret-key';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        // Get token from cookie or authorization header
        const token = req.cookies?.token ||
                      req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find user by ID
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Add user to request object
        req.user = user;
        req.userId = decoded.id;
        next();

    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Optional authentication middleware - won't reject if not authenticated
const optionalAuth = async (req, res, next) => {
    try {
        // Get token from cookie or authorization header
        const token = req.cookies?.token ||
                      req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            // Continue without authentication
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find user by ID
        const user = await User.findById(decoded.id);

        if (user) {
            // Add user to request object
            req.user = user;
            req.userId = decoded.id;
        }

        next();

    } catch (error) {
        // Continue without authentication on error
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth,
    generateToken,
    JWT_SECRET
};
