const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const PORT = 3000;
const SAVE_FILE = path.join(__dirname, 'gameState.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Load game state
app.get('/gameState', (req, res) => {
    fs.readFile(SAVE_FILE, 'utf8', (err, data) => {
        if (err) return res.status(200).json({}); // File might not exist yet
        try {
            res.json(JSON.parse(data));
        } catch {
            res.status(500).json({ error: 'Corrupt save file' });
        }
    });
});

// Save game state
app.post('/gameState', (req, res) => {
    fs.writeFile(SAVE_FILE, JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Save failed' });
        res.json({ success: true });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
