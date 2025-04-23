const axios = require('axios');
const pool = require('../dbConfig'); // Database pool for PostgreSQL

exports.handleChatRequest = async (req, res) => {
  const {
    query: userQuery,
    userId, // Unique user ID
    conversationHistory = '', // Previous context
    persistentCompanyContext = '', // Company-specific context
    name, // User's chosen chatbot name
    age, // User's chosen chatbot age
    personality, // User's chosen chatbot personality
  } = req.body;

  try {
    // First determine if userId is a google_id or regular id
    let userIdQuery;
    if (isNaN(userId)) {
      // It's a google_id (string)
      userIdQuery = await pool.query(
        `SELECT id FROM users WHERE google_id = $1`,
        [userId.toString()]
      );
    } else {
      // It's a regular id (numeric)
      userIdQuery = await pool.query(
        `SELECT id FROM users WHERE id = $1`,
        [parseInt(userId)]
      );
    }

    if (!userIdQuery.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const numericUserId = userIdQuery.rows[0].id;

    // Use the numeric ID for subsequent queries
    const tagsResult = await pool.query(
      `SELECT tags, parsed_content 
       FROM company_uploads 
       WHERE user_id = $1`,
      [numericUserId]
    );

    const uploads = tagsResult.rows;

    // Check if query matches user-uploaded tags
    const matchedUploads = uploads.filter((upload) =>
      upload.tags.some(tag => userQuery.toLowerCase().includes(tag.toLowerCase()))
    );

    let companyContext = '';
    let companyDataUsed = false;

    if (matchedUploads.length > 0) {
      companyContext = matchedUploads.map((upload) => upload.parsed_content).join('\n\n');
      companyDataUsed = true;
    } else if (persistentCompanyContext) {
      companyContext = persistentCompanyContext;
      companyDataUsed = true;
    }

    // Build the prompt with personalization
    const conversationContext = conversationHistory.trim();
    const personalityStatement = `Personality traits: ${personality || 'Friendly and helpful'}\nAge: ${age || 'Ageless'}\n`;
    const chatbotIntroduction = `Chatbot Name: ${name || 'Your AI Companion'}\n`;

    const prompt = companyDataUsed
      ? `${chatbotIntroduction}${personalityStatement}${conversationContext ? `Conversation so far:\n${conversationContext}\n\n` : ''}Use the company data below to generate a response:\n${companyContext}\n\nUser: ${userQuery}`
      : `${chatbotIntroduction}${personalityStatement}${conversationContext ? `Conversation so far:\n${conversationContext}\n\n` : ''}User: ${userQuery}`;

    // Send the prompt to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const generatedResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedResponse) {
      throw new Error('Unexpected API response structure');
    }

    // Return the personalized response
    res.status(200).json({
      response: generatedResponse,
      companyDataUsed,
      companyContext,
    });
  } catch (error) {
    console.error('Chat processing failed:', error.message);
    res.status(500).json({ message: 'Failed to process chat request!', error: error.message });
  }
};
