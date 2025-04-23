const express = require('express');
const app = express();
const path = require('path');

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '.')));

// Serve home.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});