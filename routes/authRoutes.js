// routes/authRoutes.js
const express = require('express');
const AuthController = require('../controllers/AuthController'); // Import AuthController
require('dotenv').config(); // Load environment variables

const router = express.Router();

// Login route
router.post('/login', AuthController.login); // Use the login method from AuthController

// Signup route
router.post('/signup', AuthController.signup); // Use the signup method from AuthController

// Refresh token route
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;
