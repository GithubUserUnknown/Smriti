const db = require('../dbConfig'); // Ensure this is the correct database connection

const findOrCreateUser = async (profile) => {
    const googleId = profile.id; // Unique Google ID
    const email = profile.emails?.[0]?.value || null; // Safely retrieve the email
    const name = profile.displayName || null; // User's full name
    const profilePhoto = profile.photos?.[0]?.value || null; // Safely retrieve the profile photo
  
    try {
      let user = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  
      if (user.rows.length === 0) {
        // User does not exist, create a new user
        const apiKey = uuidv4(); // Generate a unique API key
        const query = `
          INSERT INTO users (google_id, email, name, profile_photo, api_key)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
        `;
        const values = [googleId, email, name, profilePhoto, apiKey];
        const result = await db.query(query, values);
        user = result.rows[0];
      } else {
        // User exists, retrieve details
        user = user.rows[0];
      }
  
      return user;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw new Error('Database operation failed');
    }
  };

module.exports = { findOrCreateUser };