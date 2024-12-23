const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');
const { authenticate } = require('../middlewares/authMiddleware');

// Client registration (no authentication)
router.post('/register', ClientController.registerClient); // Register new client

// Client profile update (authentication required)
router.put('/profile', authenticate, ClientController.updateProfile); // Update profile

// Client password change (authentication required)
router.put('/password', authenticate, ClientController.changePassword); // Change password

module.exports = router;
