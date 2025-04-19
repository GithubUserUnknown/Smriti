const express = require('express');
const pool = require('../dbConfig');  // Your database connection
const router = express.Router();

// Endpoint to create a new personality configuration
router.post('/personalities', async (req, res) => {
  const { userId, name, gender, age, behaviorPrompt } = req.body;
  if (!userId || !name || !gender || !age) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  
  try {
    const insertQuery = `
      INSERT INTO personalities (user_id, name, gender, age, behavior_prompt)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pool.query(insertQuery, [userId, name, gender, age, behaviorPrompt]);
    return res.status(200).json({ personality: result.rows[0] });
  } catch (error) {
    console.error('Error creating personality:', error.message);
    return res.status(500).json({ message: 'Failed to create personality.' });
  }
});

// Endpoint to fetch all personality configurations for a user
router.get('/personalities', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required.' });
  }
  
  try {
    const selectQuery = `SELECT * FROM personalities WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(selectQuery, [userId]);
    return res.status(200).json({ personalities: result.rows });
  } catch (error) {
    console.error('Error fetching personalities:', error.message);
    return res.status(500).json({ message: 'Failed to fetch personalities.' });
  }
});

module.exports = router;