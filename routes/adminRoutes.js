const express = require('express');
const router = express.Router();

// Import admin controller functions
const {
    getUsers,
    getAllScores,
    deleteUser,
    deleteScore
} = require('../controllers/adminController');

// Import authentication and authorization middlewares
const {
    protect,
    adminOnly
} = require('../middleware/authMiddleware');

// ==========================================
// Admin Moderation Endpoints
// ==========================================

// GET /api/admin/users -> Retrieve all registered player accounts (Admin only)
router.get(
    '/users',
    protect,
    adminOnly,
    getUsers,
    getAllScores
);

// DELETE /api/admin/users/:userId -> Delete player account and associated scores (Admin only)
router.delete(
    '/users/:userId',
    protect,
    adminOnly,
    deleteUser
);

// DELETE /api/admin/scores/:scoreID -> Delete specific score entry (Admin only)
router.delete(
    '/scores/:scoreID',
    protect,
    adminOnly,
    deleteScore
);

module.exports = router;
