require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Check environment variables early
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
    process.exit(1);
}

// Import database connection configuration
const connectDB = require('./config/db');

// Import API route modules
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize MongoDB database connection
connectDB();

// Initialize the Express application
const app = express();

// ==========================================
// CORS Configuration
// ==========================================
const isProduction = process.env.NODE_ENV === 'production';

// In production, only allow explicitly designated front-end origins
const allowedOrigins = [
    process.env.CLIENT_ORIGIN // e.g. https://your-app.vercel.app
].filter(Boolean);

// Localhost is only permitted during local development
if (!isProduction) {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

// Scoped strictly to your repository/project deployment names on Vercel
// Change 'final-project-group2' to match your exact Vercel project name
const vercelProjectPattern = /^https:\/\/final-project-group2(-[a-zA-Z0-9-]+)?\.vercel\.app$/;

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server, uptime monitors)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin) || vercelProjectPattern.test(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Not allowed by CORS policy: ${origin}`));
    },
    credentials: true
}));

// Parse incoming JSON payloads and URL-encoded forms
app.use(express.json());
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
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint (also verifies and wakes MongoDB connection)
app.get(['/api/health', '/api'], async (req, res) => {
    try {
        const isDbReady = mongoose.connection.readyState === 1;
        if (isDbReady && mongoose.connection.db) {
            await mongoose.connection.db.admin().ping();
        }

        return res.status(200).json({
            success: true,
            status: 'online',
            database: isDbReady ? 'connected' : 'connecting',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(200).json({
            success: true,
            status: 'online',
            database: 'initializing',
            error: err.message
        });
    }
});

// ==========================================
// SPA Catch-All Route
// ==========================================
app.get('{/*splat}', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        return next();
    }
    const indexPath = getClientIndexPath();
    if (indexPath) {
        return res.sendFile(indexPath);
    }
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
app.use((req, res) => {
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