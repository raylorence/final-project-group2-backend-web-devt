const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware: Protect
 * Verifies the incoming Bearer JWT in the Authorization header.
 * Attaches the authenticated user object to req.user (excluding password).
 */
const protect = async (req, res, next) => {
    let token;

    // Check if Authorization header is present and starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extract the JWT token string after 'Bearer '
            token = req.headers.authorization.split(' ')[1];

            // Verify and decode token with JWT secret
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'secret'
            );

            // Fetch user from DB excluding password field
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User belonging to this token no longer exists'
                });
            }

            // Proceed to the next middleware or controller
            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token validation failed'
            });
        }
    }

    // Handle missing token scenario
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided in request headers'
        });
    }
};

/**
 * Authorization Middleware: Admin Only
 * Ensures that the authenticated user possesses the 'admin' role.
 */
const adminOnly = (req, res, next) => {
    // Check if user is authenticated and has admin privileges
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    // Deny access if user is not an administrator
    return res.status(403).json({
        success: false,
        message: 'Forbidden: Access is restricted to administrators only'
    });
};

module.exports = {
    protect,
    adminOnly
};
