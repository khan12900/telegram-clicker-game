require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Serve static files from the public directory
app.use('/', express.static(path.join(__dirname, 'public')));

// API Routes
app.post('/api/click', (req, res) => {
    const { telegram_id } = req.body;
    if (!telegram_id) {
        return res.status(400).json({ error: 'Telegram ID is required' });
    }
    res.json({ success: true, points: 1 });
});

app.get('/api/leaderboard', (req, res) => {
    res.json([
        { telegram_id: '123', points: 100 },
        { telegram_id: '456', points: 50 }
    ]);
});

app.get('/api/user/:telegram_id', (req, res) => {
    const { telegram_id } = req.params;
    res.json({ points: 0, boost_multiplier: 1.0 });
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Static files being served from: ${path.join(__dirname, 'public')}`);
});
