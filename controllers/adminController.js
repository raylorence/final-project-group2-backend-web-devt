const User = require('../models/User');
const Score = require('../models/Score');

/**
 * Controller: Delete User and Associated Data
 * Route: DELETE /api/admin/users/:userId
 * Access: Private/Admin
 * Description: Permanently removes a player account and cascades the deletion
 *              to all scores linked to that player.
 */
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find user by specified ID parameter
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User with ID ${userId} not found`
            });
        }

        // Cascade delete: Remove all scores associated with this user
        const deletedScores = await Score.deleteMany({ player: user._id });

        // Delete the user record
        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'User and all associated scores successfully removed',
            deletedScoresCount: deletedScores.deletedCount
        });
    } catch (error) {
        console.error('Delete User Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting user account',
            error: error.message
        });
    }
};

/**
 * Controller: Delete Score Record
 * Route: DELETE /api/admin/scores/:scoreID
 * Access: Private/Admin
 * Description: Removes an individual score entry (e.g. cheated, glitch, or illegitimate record).
 */
exports.deleteScore = async (req, res) => {
    const { scoreID } = req.params;

    try {
        // Find score by specified ID parameter
        const score = await Score.findById(scoreID);

        if (!score) {
            return res.status(404).json({
                success: false,
                message: `Score record with ID ${scoreID} not found`
            });
        }

        // Delete the score record
        await score.deleteOne();

        return res.status(200).json({
            success: true,
            message: `Score entry ${scoreID} successfully removed from leaderboard`
        });
    } catch (error) {
        console.error('Delete Score Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while deleting score entry',
            error: error.message
        });
    }
};
