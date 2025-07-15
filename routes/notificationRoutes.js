const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Create notification (protected, typically admin/agent only)
router.post('/', authMiddleware, notificationController.createNotification);

// Get user notifications
router.get('/', authMiddleware, notificationController.getUserNotifications);

// Mark as read
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

// Mark all as read
router.patch('/mark-all-read', authMiddleware, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

module.exports = router;