const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Reads the connection URI from the MONGO_URI environment variable,
 * falling back to a local MongoDB instance if not defined.
 */
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/huling-kapsula';

        // Connect to MongoDB cluster / database
        const conn = await mongoose.connect(mongoUri);

        console.log(`========================================`);
        console.log(` MongoDB Connected Successfully!`);
        console.log(` Host: ${conn.connection.host}`);
        console.log(` Database: ${conn.connection.name}`);
        console.log(`========================================`);
    } catch (error) {
        console.error(`========================================`);
        console.error(` MongoDB Connection Error:`);
        console.error(` Message: ${error.message}`);
        console.error(`========================================`);

        // Exit process with failure code if connection fails
        process.exit(1);
    }
};

module.exports = connectDB;
