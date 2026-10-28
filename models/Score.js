const mongoose = require('mongoose');

/**
 * Score Schema Definition
 * Stores survival scores and references the player who achieved them.
 */
const ScoreSchema = new mongoose.Schema(
    {
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A score record must be linked to a registered player']
        },
        totalScore: {
            type: Number,
            required: [true, 'Please provide the total score accumulated'],
            default: 0,
            min: [0, 'Score cannot be negative']
        },
        survivalTime: {
            type: Number,
            default: 0
        }
    },
    {
        // Automatically adds `createdAt` and `updatedAt` timestamps
        timestamps: true
    }
);

// Index for optimizing leaderboard queries sorted by totalScore descending
ScoreSchema.index({ totalScore: -1 });

module.exports = mongoose.model('Score', ScoreSchema);
