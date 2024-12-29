const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

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
  // Admin route to update client status
router.put('/:id/status', authenticate, authorizeAdmin, ClientController.updateClientStatus);

module.exports = router;
