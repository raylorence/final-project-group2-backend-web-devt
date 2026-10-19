const express = require('express');
const router = express.Router();

// Import admin controller functions
const {
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
