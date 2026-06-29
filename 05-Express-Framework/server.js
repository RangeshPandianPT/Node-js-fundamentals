const express = require('express');
const peopleRoutes = require('./routes/people');
const logger = require('./middleware/logger');

const app = express();
const PORT = 3000;

// Apply custom logger middleware
app.use(logger);

// Middleware to parse JSON bodies
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Welcome to the Express.js API! Check out /api/people');
});

// Mount routes
app.use('/api/people', peopleRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Express Server is running on http://localhost:${PORT}`);
    console.log(`Try accessing http://localhost:${PORT}/api/people`);
});
