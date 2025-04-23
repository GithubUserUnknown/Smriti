const express = require('express');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const db = require('../dbConfig');
const router = express.Router();


// Helper function to generate JWT token for authenticated sessions
const generateJWT = (user) => {
  return jwt.sign(
    {
      id: user.id,  // numeric id
      googleId: user.google_id.toString(), // ensure string
      email: user.email,
      apiKey: user.api_key
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      console.log('Google Profile:', req.user); // Debug log

      // Get profile data from req.user._json
      const googleId = req.user._json.sub.toString(); // ensure string
      const email = req.user._json.email;
      const name = req.user._json.name;
      const profilePhoto = req.user._json.picture;

      // Debug log
      console.log('Extracted data:', { googleId, email, name, profilePhoto });

      if (!email) {
        console.error('Error: Missing email in Google profile');
        return res.redirect('http://localhost:3000/login?error=email_missing');
      }

      // Check if user exists
      let user = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

      if (user.rows.length === 0) {
        const apiKey = uuidv4();

        // Insert new user
        const query = `
          INSERT INTO users (google_id, email, name, profile_photo, api_key)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
        `;
        const values = [googleId, email, name, profilePhoto, apiKey];
        
        // Debug log
        console.log('Inserting new user with values:', values);
        
        const result = await db.query(query, values);
        user = { rows: [result.rows[0]] };
      }

      // Generate JWT token
      const token = generateJWT(user.rows[0]);

      // Debug log
      console.log('Generated token:', token);
      
      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/auth-callback?token=${token}`);
    } catch (error) {
      console.error('Error during Google OAuth callback:', error);
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);


// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};




// Update the user-data route
router.get('/user-data', authenticateToken, async (req, res) => {
  try {
    // Get user data from the database using the ID from the token
    const result = await db.query(
      'SELECT id, google_id, email, api_key FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Generate a new embed token
    const embedToken = jwt.sign(
      { id: user.id, apiKey: user.api_key },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    
    // Return user data
    return res.json({
      apiKey: user.api_key,
      token: embedToken,
      googleId: user.google_id,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

module.exports = router;
