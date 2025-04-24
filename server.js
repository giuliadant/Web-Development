const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const PORT = 3000;
const SAVE_FILE = path.join(__dirname, 'gameState.json');

// Middleware
app.use(express.json());
app.use(express.static(path.resolve(__dirname)));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Load game state
app.get('/gameState', (req, res) => {
    console.log("GET /gameState called");
    fs.readFile(SAVE_FILE, 'utf8', (err, data) => {
        if (err) return res.status(200).json({}); // fallback to empty state
        try {
            res.json(JSON.parse(data));
        } catch {
            res.status(500).json({ error: 'Corrupt save file' });
        }
    });
});

// Save game state
app.post('/gameState', (req, res) => {
    console.log("POST /gameState called with data:", req.body);

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid save data' });
    }

    fs.writeFile(SAVE_FILE, JSON.stringify(req.body, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Save failed' });
        res.json({ success: true });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

