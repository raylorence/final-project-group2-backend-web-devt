const express = require('express');
const router = express.Router();

// Import authentication controller functions
const {
    registerUser,
    loginUser
} = require('../controllers/authController');

// ==========================================
// Authentication Endpoints
// ==========================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new player/admin account and obtain a JWT session token
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and obtain a JWT session token
 * @access  Public
 */
router.post('/login', loginUser);

module.exports = router;
