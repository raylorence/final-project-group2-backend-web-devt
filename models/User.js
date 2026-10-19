const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User Schema Definition
 * Stores information regarding registered players and administrators.
 */
const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please provide a unique username'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters long'],
            maxlength: [30, 'Username cannot exceed 30 characters']
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters long']
        },
        role: {
            type: String,
            enum: {
                values: ['player', 'admin'],
                message: '{VALUE} is not a valid user role'
            },
            default: 'player'
        }
    },
    {
        // Automatically adds `createdAt` and `updatedAt` timestamps
        timestamps: true
    }
);

/**
 * Pre-Save Mongoose Hook
 * Automatically hashes the user's password using bcrypt before persisting to the database.
 */
UserSchema.pre('save', async function (next) {
    // Only hash password if it has been modified or is newly created
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate cryptographic salt with factor of 10
        const salt = await bcrypt.genSalt(10);

        // Hash plaintext password with generated salt
        this.password = await bcrypt.hash(this.password, salt);

        next();
    } catch (err) {
        next(err);
    }
});

/**
 * Instance Method: comparePassword
 * Compares an incoming plain-text password with the stored hashed password.
 * @param {string} candidatePassword - Plain text password input by user.
 * @returns {Promise<boolean>} True if match, false otherwise.
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
