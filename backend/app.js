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
app.use(cors({
  origin: process.env.REACT_APP_FRONTEND_URL, // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Set default headers for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database connection check
const pool = require('./dbConfig');
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Only set X-Frame-Options for routes that do not need iframe embedding
  if (!req.path.startsWith('/chatbot')) {
    res.setHeader('X-Frame-Options', 'DENY');
  }
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});



// Session configuration
const passport = require('./middleware/passportConfig');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);

app.use(session({
  store: new PgSession({
    pool, // PostgreSQL connection pool
    tableName: 'session' // Table name for storing sessions
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 
  }
}));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Smriti AI Generator API',
    status: 'active',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      api: '/api',
      chat: '/api/chat',
      chatbot: '/chatbot',
      health: '/api/health'
    }
  });
});

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Register authentication routes
app.use('/auth', authRoutes);

// Chatbot route
app.use('/chatbot', chatbotRoutes);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Time: ${new Date().toISOString()}`);
});
