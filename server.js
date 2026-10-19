const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import database connection configuration
const connectDB = require('./config/db');

// Import API route modules
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables from .env file
dotenv.config();

// Initialize MongoDB database connection
connectDB();

// Initialize the Express application
const app = express();

// ==========================================
// Global Middlewares
// ==========================================

// Enable Cross-Origin Resource Sharing (CORS) for frontend requests
app.use(cors());

// Parse incoming JSON payloads in request bodies
app.use(express.json());

// Parse incoming URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ==========================================
// API Routes Registration
// ==========================================

// Authentication routes (Register, Login)
app.use('/api/auth', authRoutes);

// Score & Leaderboard routes (Submit score, Fetch top scores)
app.use('/api/scores', scoreRoutes);

// Admin Moderation routes (Delete users, Delete scores)
app.use('/api/admin', adminRoutes);

// ==========================================
// Health Check / Root Endpoint
// ==========================================
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Huling Kapsula Game API is running smoothly.',
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// 404 Catch-All Handler
// ==========================================
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Resource not found: ${req.originalUrl}`
    });
});

// ==========================================
// Server Port & Listener
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(` Huling Kapsula Backend Server`);
    console.log(` Running on Port: ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`========================================`);
});
