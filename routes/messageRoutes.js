const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const { authenticate } = require('../middlewares/authenticate'); // JWT middleware

// Send a message
router.post('/send', authenticate, MessageController.sendMessage);

// Get messages between two users
router.get('/conversation/:userId', authenticate, MessageController.getMessages);

// Mark a message as read
router.put('/mark-read/:messageId', authenticate, MessageController.markAsRead);

module.exports = router;