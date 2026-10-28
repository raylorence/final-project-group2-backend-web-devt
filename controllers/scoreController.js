const Score = require('../models/Score');

/**
 * Controller: Submit Score (Post-Match / High Score Update)
 * Route: POST /api/scores
 * Access: Private (Requires authenticated player JWT)
 * Description: Submits a new run score. If the player already has a high score record,
 *              updates their personal best if the new score surpasses it (CRUD Update requirement).
 */
exports.submitScore = async (req, res) => {
    const { totalScore, survivalTime } = req.body;

    try {
        // Prevent admin accounts from playing and recording scores
        if (req.user && req.user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admins are not allowed to submit scores or play the game'
            });
        }

        // Validate score input
        if (totalScore === undefined || totalScore === null || typeof totalScore !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid numeric totalScore'
            });
        }

        const playerId = req.user._id;

        // Fetch the existing score from the database
        let existingScore = await Score.findOne({ player: playerId });

        if (existingScore) {
            // Personal Best Synchronization logic (with survivalTime tie-breaker)
            if (totalScore > existingScore.totalScore || (totalScore === existingScore.totalScore && survivalTime > existingScore.survivalTime)) {
                const previousBest = existingScore.totalScore;
                existingScore.totalScore = totalScore;
                existingScore.survivalTime = survivalTime || existingScore.survivalTime;

                await existingScore.save();

                return res.status(200).json({
                    success: true,
                    message: 'New personal best score recorded and updated!',
                    isPersonalBest: true,
                    previousBest: previousBest,
                    data: existingScore
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: 'Score submitted. Personal best remains unchanged.',
                    isPersonalBest: false,
                    personalBest: existingScore.totalScore,
                    data: existingScore
                });
            }
        } else {
            // Create first score entry for this player
            const newScore = await Score.create({
                const newScore = await Score.create({
                player: playerId,
                totalScore: totalScore,
                survivalTime: survivalTime || 0
            });
        });

            return res.status(201).json({
                success: true,
                message: 'First score entry created successfully!',
                isPersonalBest: true,
                data: newScore
            });
        }
    } catch (error) {
        console.error('Submit Score Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while submitting score',
            error: error.message
        });
    }
};

/**
 * Controller: Get Leaderboard Scores
 * Route: GET /api/scores
 * Access: Public
 * Description: Retrieves the top 10 survival scores sorted in descending order,
 *              populated with the player's username.
 */
exports.getScores = async (req, res) => {
    try {
        // Query top 10 scores sorted from highest to lowest
        const leaderboard = await Score.find()
            .populate('player', 'username role')
            .sort({ totalScore: -1, survivalTime: -1 }) // Breaks ties with survival duration
            .limit(10);

        return res.status(200).json({
            success: true,
            count: leaderboard.length,
            data: leaderboard
        });
    } catch (error) {
        console.error('Get Scores Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while retrieving leaderboard',
            error: error.message
        });
    }
};

exports.getMyBestScore = async (req, res) => {
    try {
        const score = await Score.findOne({ player: req.user._id });
        return res.status(200).json({
            success: true,
            best: score ? score.totalScore : 0,
            survivalTime: score ? score.survivalTime || 0 : 0,
            data: score
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
