const jwt = require('jsonwebtoken');
const pool = require('../dbConfig');

const authMiddleware = async (req, res, next) => {
  try {
    // Try to obtain the token from multiple sources
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
        token = decodeURIComponent(req.query.token).trim();
      }

    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find user in database using either googleId or id from the token
    let user;
    if (decoded.googleId) {
      const result = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [decoded.googleId.toString()]
      );
      user = result.rows[0];
    }
    if (!user && decoded.id) {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.id]
      );
      user = result.rows[0];
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Verify API key if provided
    if (req.query.apiKey && req.query.apiKey !== user.api_key) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Attach user details to the request object
    req.user = {
      id: user.id, // numeric id
      googleId: user.google_id, // google id
      email: user.email,
      apiKey: user.api_key
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        error: error.message,
        type: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
