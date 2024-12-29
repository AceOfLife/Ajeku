const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');

// Client registration (no authentication)
router.post('/register', ClientController.createClient);
router.put('/:id/profile', ClientController.updateProfile);

module.exports = router;
