const express = require('express');
const pool = require('../dbConfig'); // Database pool for PostgreSQL
const router = express.Router();
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
router.get('/', authMiddleware, async (req, res) => {
  const {
    apiKey,
    token,
    name = 'AI Assistant',
    gender = 'neutral',
    age = '',
    behaviorPrompt = 'Friendly and helpful',
    // Enhanced customization options:
    theme = 'light',
    position = 'right',
    primaryColor = '#2563eb',
    secondaryColor = '#3b82f6',
    accentColor = '#60a5fa',
    buttonColor = '#2563eb',
    buttonText = 'Chat with AI',
    headerColor = '#ffffff',
    chatBubbleColor = '#f0f0f0',
    fontFamily = 'Inter, system-ui, -apple-system, sans-serif',
    borderRadius = '16px',
    animation = 'slide',
    messageAlignment = 'right',
    showTimestamp = 'true',
    showAvatar = 'true',
    enableEmoji = 'true',
    enableAttachments = 'true',
    enableVoice = 'true',
    glassmorphism = 'false'
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
    const sanitize = (str) => str.replace(/[<>]/g, '');
  const sanitizedName = sanitize(name);
  const sanitizedGender = sanitize(gender);
  const sanitizedAge = sanitize(age.toString());
  const sanitizedBehaviorPrompt = sanitize(decodeURIComponent(behaviorPrompt));


    // Set the correct Content-Type for HTML
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${sanitizedName}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
            --accent-color: ${accentColor};
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --bg-primary: ${theme === 'dark' ? '#1f2937' : '#ffffff'};
            --bg-secondary: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
            --border-color: ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --user-message-bg: #dcf8c6;
            --ai-message-bg: #ffffff;
            --chat-bg: #efeae2;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          body {
            font-family: ${fontFamily};
            background: transparent;
            color: var(--text-primary);
          }
          ::-webkit-scrollbar {
            display: none;
          }
          /* Chatbot container fills the iframe */
          #chatbot-container {
            position: relative;
            width: 400px;
            height: 600px;
            background: var(--bg-primary);
            border-radius: ${borderRadius};
            box-shadow: var(--shadow-lg);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            ${glassmorphism === 'true' ? `
              backdrop-filter: blur(10px);
              background: rgba(255, 255, 255, 0.8);
              border: 1px solid rgba(255, 255, 255, 0.2);
            ` : ''}
            transition: all 0.3s ease;
          }

          #chatbot-header {
            padding: 1.25rem;
            background: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            height: 60px;
          }

          .avatar {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
          }

          .header-text {
            flex: 1;
          }

          .header-text h1 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .header-text p {
            font-size: 0.75rem;
            opacity: 0.9;
          }

          #messages {
              flex: 1;
              padding: 1rem;
              overflow-y: auto;
              overflow-x: hidden; /* Prevents scrollbar */
              max-height: 80vh; /* Prevents messages from overflowing */
              word-wrap: break-word; /* Breaks long words into multiple lines */
              display: flex;
              flex-direction: column;
              gap: 8px;
          }

          .message-wrapper {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            scroll-behavior: smooth;
          }

          .message {
            max-width: 75%; /* Prevents messages from stretching across full width */
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.9375rem;
  word-wrap: break-word; /* Wraps long words */
  overflow-wrap: break-word; /* Ensures text breaks when needed */
  white-space: pre-line; /* Maintains formatting & wraps long lines */
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);

          }

          .message.user {
            margin-left: auto;
            flex-direction: row-reverse;
          }

          .message.user::after {
            content: '';
            position: absolute;
            top: 0;
            right: -8px;
            width: 8px;
            height: 13px;
            // background: var(--user-message-bg);
            clip-path: polygon(0 0, 100% 100%, 0 100%);
          }

          .message.ai {
            align-self: flex-start;
            // background: var(--ai-message-bg);
            border-top-left-radius: 0;
            flex-direction: row;
          }

          .message.ai::after {
            content: '';
            position: absolute;
            top: 0;
            left: -8px;
            width: 8px;
            height: 13px;
            // background: var(--ai-message-bg);
            clip-path: polygon(100% 0, 100% 100%, 0 100%);
          }

          .user-msg-style{
          width: max-content;
    
    background: darkmagenta;
    padding: 8px;
    border-radius: 10px;
    color: white;
    margin: 5px;

    }

    .bot-msg-style{
    width: max-content;
    background: #e5e5e5;
    padding: 8px;
    border-radius: 10px;
    color: black;
    margin: 5px;
    align-self: end;
        font-weight: 500;
    }

          .timestamp {
            font-size: 0.6875rem;
            color: #667781;
            margin-top: 1px;
            padding: 0 4px;
          }

          .message.user .timestamp {
            align-self: flex-end;
          }

          .message.ai .timestamp {
            align-self: flex-start;
          }

          #controls {
            padding: 0.75rem;
            background: var(--bg-primary);
            border-top: 1px solid var(--border-color);
          }

          .input-wrapper {
            display: flex;
            gap: 0.5rem;
            align-items: flex-end;
            background: white;
            border-radius: 24px;
            padding: 0.5rem;
          }

          #userInput {
            flex: 1;
            border: none;
            padding: 0.5rem;
            font-size: 0.9375rem;
            max-height: 100px;
            resize: none;
            background: transparent;
          }

          #userInput:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
          }

          .button {
            padding: 0.75rem;
            border: none;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .button:hover {
            background: var(--secondary-color);
            transform: translateY(-1px);
          }

          .button:active {
            transform: translateY(1px);
          }

          .toolbar {
            display: flex;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
          }

          .toolbar-button {
            padding: 0.5rem;
            border: none;
            border-radius: 50%;
            background: transparent;
            color: #8696a0;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .toolbar-button:hover {
            background: rgba(0, 0, 0, 0.05);
          }

          .typing-indicator {
            display: flex;
            gap: 0.5rem;
            padding: 0.75rem;
            background: var(--bg-secondary);
            border-radius: 1rem;
            width: fit-content;
            margin: 0.5rem 0;
          }

          .typing-dot {
            width: 8px;
            height: 8px;
            background: var(--text-secondary);
            border-radius: 50%;
            animation: typing 1s infinite ease-in-out;
          }

          .send-button {
            background: var(--primary-color);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .send-button:hover {
            background: var(--secondary-color);
          }

          .send-button svg {
            width: 20px;
            height: 20px;
            color: white;
          }

          @keyframes typing {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }

          @keyframes messageAppear {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .emoji-picker-container {
            position: absolute;
            bottom: 100%;
            left: 1rem;
            z-index: 1000;
          }

          /* Scrollbar */
          #messages::-webkit-scrollbar {
            width: 6px;
          }

          #messages::-webkit-scrollbar-track {
            background: transparent;
          }

          #messages::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
          }

          /* Dark Theme Adjustments */
          ${theme === 'dark' ? `
            #userInput {
              color: white;
              background: var(--bg-secondary);
            }

            .message.bot {
              background: var(--bg-secondary);
              color: white;
            }
          ` : ''}

          /* Mobile Responsiveness */
          @media (max-width: 480px) {
            #chatbot-container {
              width: 100%;
              height: 100vh;
              border-radius: 0;
            }

            .message {
              max-width: 85%;
            }
          }
        </style>
      </head>
      <body>
        <div id="chatbot-container">
          <div id="chatbot-header">
            <div class="avatar">
              🤖
            </div>
            <div class="header-text">
              <h1>${sanitizedName}</h1>
              <p>AI Assistant</p>
            </div>
          </div>

          <div id="messages"></div>

<!-- Add this somewhere inside your body -->
<div id="emoji-picker-container" style="position: absolute;"></div>

          <div id="controls">
            <div class="input-wrapper">
              
                <button class="toolbar-button" id="emojiButton">😊</button>
              
              ${enableAttachments === 'true' ? `
                <button class="toolbar-button" id="attachButton">📎</button>
              ` : ''}
              <textarea
                id="userInput"
                placeholder="Type your message..."
                rows="1"
              ></textarea>
              
                <button class="toolbar-button" id="voiceButton">🎤</button>
              
              <button class="send-button" id="sendMessage">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      
        <!-- Scripts -->
            <script type="module">
  import 'https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js';

  document.addEventListener('DOMContentLoaded', function() {
    const picker = document.createElement('emoji-picker');
    const container = document.getElementById('emoji-picker-container');
    const emojiButton = document.getElementById('emojiButton');
    
    // Initially hide the picker
    container.style.display = 'none';
    container.appendChild(picker);

    // Toggle picker visibility when emoji button is clicked
    emojiButton.addEventListener('click', () => {
      container.style.display = container.style.display === 'none' ? 'block' : 'none';
    });

    // Add emoji to input when selected
    picker.addEventListener('emoji-click', event => {
      document.getElementById('userInput').value += event.detail.unicode;
      // Optionally hide picker after selection
      // container.style.display = 'none';
    });

    // Close picker when clicking outside
    document.addEventListener('click', (event) => {
      if (!container.contains(event.target) && event.target !== emojiButton) {
        container.style.display = 'none';
      }
    });
  });
</script>
    

        <script>
  document.addEventListener('DOMContentLoaded', function() {
    const authToken = '${token}';

    // --- Voice Input using the Web Speech API ---
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      const voiceButton = document.getElementById('voiceButton');
      if(voiceButton) {
        voiceButton.addEventListener('click', () => {
          recognition.start();
        });
      }
      recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('userInput').value = transcript;
      });
      recognition.addEventListener('error', (event) => {
        console.error('Voice recognition error:', event.error);
      });
    } else {
      const voiceButton = document.getElementById('voiceButton');
      if(voiceButton) {
        voiceButton.disabled = true;
      }
    }
   

    // --- Attachments: Trigger file dialog and display selected file name ---
    ${enableAttachments === 'true'
      ? `
    const attachButton = document.getElementById('attachButton');
    const fileInput = document.getElementById('fileInput');
    if (attachButton && fileInput) {
      attachButton.addEventListener('click', () => {
        fileInput.click();
      });
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const messagesDiv = document.getElementById('messages');
          const fileMsgDiv = document.createElement('div');
          fileMsgDiv.textContent = 'Attachment: ' + file.name;
          messagesDiv.appendChild(fileMsgDiv);
          // Optionally, implement file uploading logic here
          e.target.value = '';
        }
      });
    }
    `
      : ''
    }

    // --- Function to send chat messages ---
    async function sendMessage() {
      const userInput = document.getElementById('userInput');
      const message = userInput.value.trim();
      if (!message) return;
  
      const messagesDiv = document.getElementById('messages');
      const userMsgDiv = document.createElement('div');
      userMsgDiv.className = "user-msg-style message";
      userMsgDiv.textContent = 'You: ' + message;
      messagesDiv.appendChild(userMsgDiv);
      scrollToBottom();
  
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
          },
          body: JSON.stringify({
            query: message,
            userId: '${req.user.id}',
            conversationHistory: Array.from(messagesDiv.children).map(el => el.textContent).join('\\n'),
            name: '${sanitizedName}',
            age: '${sanitizedAge}',
            gender: '${sanitizedGender}',
            personality: '${sanitizedBehaviorPrompt}'
          })
        });
  
        if (!response.ok) {
          throw new Error('Request failed with status ' + response.status);
        }
        const data = await response.json();
        const chatbotMsgDiv = document.createElement('div');
        chatbotMsgDiv.className = "message bot-msg-style";
        chatbotMsgDiv.textContent = data.response;
        messagesDiv.appendChild(chatbotMsgDiv);
        scrollToBottom();

      } catch (error) {
        console.error('Error communicating with chatbot:', error);
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Error: Failed to get response from chatbot.';
        errorDiv.style.color = 'red';
        messagesDiv.appendChild(errorDiv);
      }
      userInput.value = '';
    }
  function scrollToBottom() {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


    // --- Event Listeners for Message Sending ---
  
    const sendButton = document.getElementById('sendMessage');
    if (sendButton) {
      sendButton.addEventListener('click', sendMessage);
    }
  
    // Listener for Enter key (sends message) and Shift+Enter (inserts newline)
    const userInputArea = document.getElementById('userInput');
    if (userInputArea) {
      userInputArea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault(); // Prevent newline and send message
          sendMessage();
        }
      });
    }
  });
</script>
      </body>
    </html>
  `;

  // Set content type and send the HTML
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}catch (error) {
    console.error('Error rendering chatbot:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
