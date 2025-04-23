const express = require('express');
const cors = require('cors');
const app = express();
const uploadRoutes = require('./routes/uploadRoutes');
require('dotenv').config();
const personalityRoutes = require('./routes/personalityRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes'); // Import chatbot routes

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Set default headers for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const pool = require('./dbConfig');
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Database connection successful:', res.rows[0]);
    }
});


const passport = require('./middleware/passportConfig'); // Import Passport configuration
const session = require('express-session'); // For session handling

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Ensure you have a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Enable secure cookies only in production
      httpOnly: true, // Helps mitigate XSS attacks
      maxAge: 1000 * 60 * 60 * 24, // Optional: Set cookie expiration time (1 day)
    },
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Register authentication routes
app.use('/auth', authRoutes);

// Chatbot route
app.use('/', chatbotRoutes);

// Routes
app.use('/api', uploadRoutes);

app.use('/api', personalityRoutes);

app.use('/api/chat', chatRoutes);

app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
