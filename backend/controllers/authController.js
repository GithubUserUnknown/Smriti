// controllers/authController.js
const pool = require('../dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if the user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rowCount > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate a unique API key for the user
    const apiKey = uuidv4();

    // Insert the new user into the database
    const insertQuery = `
      INSERT INTO users (email, password, api_key)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const newUser = await pool.query(insertQuery, [email, hashedPassword, apiKey]);

    // Create a JWT token which can be used for subsequent authenticated requests
    const token = jwt.sign(
      { id: newUser.rows[0].id, apiKey: newUser.rows[0].api_key },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully.',
      token,
      apiKey: newUser.rows[0].api_key,
      user: { id: newUser.rows[0].id, email: newUser.rows[0].email }
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Fetch user from the database
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rowCount === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const user = userQuery.rows[0];

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate a JWT token for authenticated sessions
    const token = jwt.sign(
      { id: user.id, apiKey: user.api_key },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      apiKey: user.api_key,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};