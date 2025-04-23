const express = require('express');
const pool = require('../dbConfig'); // Database pool for PostgreSQL
const router = express.Router();

// Route to render the chatbot
const authMiddleware = require('../middleware/authMiddleware');
router.get('/', authMiddleware, async (req, res) => {
  const { 
    apiKey, 
    token, 
    name = 'Chatbot', 
    gender = 'neutral', 
    age = '', 
    behaviorPrompt = 'Friendly and helpful' 
  } = req.query;

  if (!apiKey || !token) {
    return res.status(400).send('Missing API key or token');
  }

  try {
    const userQuery = `
      SELECT * FROM users 
      WHERE api_key = $1 
      AND (id = $2 OR google_id = $3)
    `;
    
    const values = [
      apiKey, 
      req.user.id, // numeric
      req.user.google_id?.toString() // ensure string
    ];
    
    const userResult = await pool.query(userQuery, values);

    // Get conversation history
    const historyQuery = `
      SELECT query, response 
      FROM query_history 
      WHERE user_id = $1 OR google_id = $2 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const historyResult = await pool.query(historyQuery, [
      userResult.rows[0].id, // numeric
      userResult.rows[0].google_id?.toString() // ensure string
    ]);

    if (!userResult.rows.length) {
      return res.status(403).send('Invalid API key');
    }

    // Sanitize and validate inputs
    const sanitizedName = name.replace(/[<>]/g, '');
    const sanitizedGender = gender.replace(/[<>]/g, '');
    const sanitizedAge = age.toString().replace(/[<>]/g, '');
    const sanitizedBehaviorPrompt = behaviorPrompt.replace(/[<>]/g, '');

    // Set the correct Content-Type for HTML
    res.setHeader('Content-Type', 'text/html');

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${sanitizedName}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f0f0f0;
            }
            #chatbot-container {
              border: 1px solid #ccc;
              background: #fff;
              padding: 20px;
              width: 800px;
              height: 600px;
              box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
              overflow-y: hidden;
            }
          </style>
        </head>
        <body>
          <div id="chatbot-container">
            <h1>Hello, I am ${sanitizedName}!</h1>
            <p>I am a ${sanitizedGender} chatbot${sanitizedAge ? `, ${sanitizedAge} years old` : ''}, and my personality is: ${sanitizedBehaviorPrompt}</p>
            <div id="messages" style="margin-top: 20px; overflow-y: auto; height: 400px;"></div>
            <input id="userInput" type="text" placeholder="Type your message..." style="width: calc(100% - 20px); margin-top: 10px;" />
            <button id="sendMessage" style="margin-top: 10px;">Send</button>
          </div>
          <script>
            // Store token for use in requests
            const authToken = '${token}';
            
            document.getElementById('sendMessage').addEventListener('click', async () => {
              const userMessage = document.getElementById('userInput').value.trim();
              if (!userMessage) return;

              const messages = document.getElementById('messages');
              const userDiv = document.createElement('div');
              userDiv.textContent = 'You: ' + userMessage;
              messages.appendChild(userDiv);

              try {
                const response = await fetch('/api/chat/chatbot', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + authToken
                  },
                  body: JSON.stringify({
                    query: userMessage,
                    userId: '${userResult.rows[0].id}', // Using ID from authenticated user
                    conversationHistory: Array.from(messages.children).map(msg => msg.textContent).join('\\n'), // Previous context
                    name: '${sanitizedName}',
                    age: '${sanitizedAge}',
                    personality: '${sanitizedBehaviorPrompt}',
                  }),
                });

                if (!response.ok) {
                  throw new Error('Response not ok: ' + response.status);
                }

                const data = await response.json();
                const chatbotDiv = document.createElement('div');
                chatbotDiv.textContent = 'Chatbot: ' + data.response;
                messages.appendChild(chatbotDiv);
              } catch (error) {
                console.error('Error communicating with the chatbot:', error);
                const errorDiv = document.createElement('div');
                errorDiv.textContent = 'Error: Failed to get response from chatbot';
                errorDiv.style.color = 'red';
                messages.appendChild(errorDiv);
              }

              document.getElementById('userInput').value = '';
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rendering chatbot:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
