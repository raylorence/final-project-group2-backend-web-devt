const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Utility Function: generateToken
 * Creates a signed JWT token containing the user's MongoDB ObjectId.
 *
 * @param {string} id - The MongoDB ObjectId of the user.
 * @returns {string} Signed JWT string valid for 30 days.
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || 'secret',
        {
            expiresIn: '30d'
        }
    );
};

/**
 * Controller: Register User
 * Route: POST /api/auth/register
 * Access: Public
 * Description: Registers a new player or admin, hashes their password, and issues a JWT session token.
 */
exports.registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both username and password'
            });
        }

        // Check if username is already taken
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Username is already registered'
            });
        }

        // Create new user in the database
        const user = await User.create({
            username,
            password,
            role: 'player'
        });

        if (user) {
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        }
    } catch (error) {
        console.error('Registration Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error during user registration',
            error: error.message
        });
    }
};

/**
 * Controller: Login User
 * Route: POST /api/auth/login
 * Access: Public
 * Description: Authenticates existing credentials and returns a JWT session token.
 */
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both username and password'
            });
        }

        // Find user by username
        const user = await User.findOne({ username });

        // Verify user exists and password is valid
        if (user && (await user.comparePassword(password))) {
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
    } catch (error) {
        console.error('Login Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error during user login',
            error: error.message
        });
    }
};
