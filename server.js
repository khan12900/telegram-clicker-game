require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('game.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            telegram_id TEXT PRIMARY KEY,
            points INTEGER DEFAULT 0,
            last_click TIMESTAMP,
            boost_multiplier FLOAT DEFAULT 1.0
        )`);

        // Leaderboard table
        db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
            telegram_id TEXT PRIMARY KEY,
            points INTEGER DEFAULT 0,
            FOREIGN KEY(telegram_id) REFERENCES users(telegram_id)
        )`);

        // Referrals table
        db.run(`CREATE TABLE IF NOT EXISTS referrals (
            referrer_id TEXT,
            referred_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(referrer_id, referred_id),
            FOREIGN KEY(referrer_id) REFERENCES users(telegram_id),
            FOREIGN KEY(referred_id) REFERENCES users(telegram_id)
        )`);
    });
}

// API Routes
app.post('/api/click', (req, res) => {
    const { telegram_id } = req.body;
    if (!telegram_id) {
        return res.status(400).json({ error: 'Telegram ID is required' });
    }

    db.run(
        'INSERT INTO users (telegram_id, points) VALUES (?, 1) ON CONFLICT(telegram_id) DO UPDATE SET points = points + 1, last_click = CURRENT_TIMESTAMP',
        [telegram_id],
        (err) => {
            if (err) {
                console.error('Error updating points:', err);
                res.status(500).json({ error: 'Failed to update points' });
            } else {
                res.json({ success: true });
            }
        }
    );
});

app.get('/api/leaderboard', (req, res) => {
    db.all(
        'SELECT telegram_id, points FROM users ORDER BY points DESC LIMIT 10',
        [],
        (err, rows) => {
            if (err) {
                console.error('Error fetching leaderboard:', err);
                res.status(500).json({ error: 'Failed to fetch leaderboard' });
            } else {
                res.json(rows);
            }
        }
    );
});

app.get('/api/user/:telegram_id', (req, res) => {
    const { telegram_id } = req.params;
    db.get(
        'SELECT points, boost_multiplier FROM users WHERE telegram_id = ?',
        [telegram_id],
        (err, row) => {
            if (err) {
                console.error('Error fetching user data:', err);
                res.status(500).json({ error: 'Failed to fetch user data' });
            } else {
                res.json(row || { points: 0, boost_multiplier: 1.0 });
            }
        }
    );
});

// Serve the main game page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
