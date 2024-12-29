const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');

// Client registration (no authentication)
router.post('/register', ClientController.createClient);
// Route to update profile
router.put('/:id/profile', authenticate, async (req, res, next) => {
    // Ensure the authenticated user is updating their own profile
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }
  
    next();  // Proceed to the updateProfile controller if the user owns the profile
  }, ClientController.updateProfile);

module.exports = router;
