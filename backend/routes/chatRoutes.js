// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// Protect the /chat endpoint
router.post('/', authMiddleware, chatController.handleChatRequest);

module.exports = router;