require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Check environment variables early
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
    process.exit(1);
}




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
// Restrict CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true
}));

// Parse incoming JSON payloads in request bodies
app.use(express.json());

// Parse incoming URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Frontend Static Assets Serving
// ==========================================
const distCandidates = [
    path.resolve(__dirname, '../../dist'),
    path.resolve(__dirname, '../dist'),
    path.resolve(__dirname, 'dist'),
    path.resolve(__dirname, 'public')
];

distCandidates.forEach(distPath => {
    if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
    }
});

// Helper to find client build index.html
const getClientIndexPath = () => {
    for (const candidate of distCandidates) {
        const indexPath = path.join(candidate, 'index.html');
        if (fs.existsSync(indexPath)) {
            return indexPath;
        }
    }
    return null;
};

// ==========================================
// API Routes Registration
// ==========================================

// Authentication routes (Register, Login)
app.use('/api/auth', authRoutes);

// Score & Leaderboard routes (Submit score, Fetch top scores)
app.use('/api/scores', scoreRoutes);

// Admin Moderation routes (Delete users, Delete scores)
app.use('/api/admin', adminRoutes);

// Health check endpoints
app.get(['/api/health', '/api'], (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Huling Kapsula Game API is running smoothly.',
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// SPA Catch-All Route (Page Refresh Support)
// ==========================================
app.get('{/*splat}', (req, res, next) => {
    // Avoid intercepting unmatched API calls
    if (req.originalUrl.startsWith('/api')) {
        return next();
    }

    const indexPath = getClientIndexPath();
    if (indexPath) {
        return res.sendFile(indexPath);
    }

    // Default API message if frontend is not built
    if (req.path === '/') {
        return res.status(200).json({
            success: true,
            message: 'Huling Kapsula Game API is running smoothly.',
            timestamp: new Date().toISOString()
        });
    }

    next();
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
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`========================================`);
    console.log(` Huling Kapsula Backend Server`);
    console.log(` Running on: http://${HOST}:${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`========================================`);
});
