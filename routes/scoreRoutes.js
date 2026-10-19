const express = require('express');
const router = express.Router();

// Import score controller functions
const {
    getScores,
    submitScore,
    getMyBestScore
} = require('../controllers/scoreController');

// Import authentication middleware
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyBestScore);

// ==========================================
// Score & Leaderboard Endpoints
// ==========================================

// GET /api/scores -> Fetch top 10 leaderboard scores sorted in descending order (Public)
// POST /api/scores -> Submit a match score and synchronize personal best (Protected)
router
    .route('/')
    .get(getScores)
    .post(protect, submitScore);

module.exports = router;
