const express = require('express');
const cors = require('cors');
const app = express();
const uploadRoutes = require('./routes/uploadRoutes');
require('dotenv').config();
const personalityRoutes = require('./routes/personalityRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes'); // Import chatbot routes
const compression = require('compression');

// Middleware
const whitelist = [
  process.env.REACT_APP_FRONTEND_URL,
  'http://localhost:3000',
  'https://smriti-ai-generator.onrender.com/'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Add compression middleware
app.use(compression());

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const pool = require('./dbConfig');
pool.query('SELECT NOW()', (err, res) => {
  console.log('Connected to database');
});


const passport = require('./middleware/passportConfig'); // Import Passport configuration
const session = require('express-session'); // For session handling
const PgSession = require('connect-pg-simple')(session);

app.use(session({
  store: new PgSession({
    pool, // PostgreSQL connection pool
    tableName: 'session' // Table name for storing sessions
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7-day expiration
}));


// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Register authentication routes
app.use('/auth', authRoutes);

// Routes
app.use('/api', uploadRoutes);

app.use('/api', personalityRoutes);

app.use('/api/chat', chatRoutes);

app.use('/api/auth', authRoutes);

// Chatbot route
app.use('/chatbot', chatbotRoutes);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
