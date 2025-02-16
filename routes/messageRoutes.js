const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const { authenticate } = require('../middlewares/authMiddleware'); // JWT middleware

// Send a message
router.post('/send', authenticate, MessageController.sendMessage);

// Get messages between the authenticated user and another user
router.get('/conversation/:recipientId', authenticate, MessageController.getMessages);

// Mark a message as read (only if it belongs to the authenticated user)
router.put('/mark-read/:messageId', authenticate, MessageController.markAsRead);

module.exports = router;
