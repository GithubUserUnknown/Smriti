const express = require('express');
const pool = require('../dbConfig');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint to create a new personality configuration
router.post('/personalities', authMiddleware, async (req, res) => {
  try {
    const { name, gender, age, behaviorPrompt } = req.body;
    const userId = req.user.id; // numeric id
    const googleId = req.user.googleId?.toString(); // google id from token

    if (!userId && !googleId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!name || !gender || !age) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    const insertQuery = `
      INSERT INTO personalities (user_id, google_id, name, gender, age, behavior_prompt)
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      userId, 
      googleId,
      name, 
      gender, 
      age, 
      behaviorPrompt
    ]);
    
    return res.status(200).json({ personality: result.rows[0] });
  } catch (error) {
    console.error('Error creating personality:', error);
    return res.status(500).json({ 
      message: 'Failed to create personality.',
      error: error.message 
    });
  }
});

// Endpoint to fetch all personality configurations for a user
router.get('/personalities', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.query;
    const currentUserId = req.user.id;
    const currentGoogleId = req.user.googleId?.toString();

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    // Verify the requested userId matches the authenticated user
    if (userId !== currentGoogleId && userId !== currentUserId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to personalities' });
    }
    
    const selectQuery = `
      SELECT * FROM personalities 
      WHERE google_id = $1 OR user_id = $2 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(selectQuery, [userId, currentUserId]);
    return res.status(200).json({ personalities: result.rows });
  } catch (error) {
    console.error('Error fetching personalities:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch personalities.',
      error: error.message 
    });
  }
});

module.exports = router;
