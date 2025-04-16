const express = require('express');
const cors = require('cors');
const app = express();
const uploadRoutes = require('./routes/uploadRoutes');

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

const pool = require('./dbConfig');
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Database connection successful:', res.rows[0]);
    }
});

// Routes
app.use('/api', uploadRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});