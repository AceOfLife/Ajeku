const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../config/multerConfig');

// Client registration (no authentication)
router.post('/register', ClientController.createClient);

// Route to update profile
// router.put('/profile', authenticate, upload, async (req, res, next) => {
//     // Ensure the authenticated user is updating their own profile
//     if (req.user.id !== parseInt(req.params.id)) {
//       return res.status(403).json({ message: 'You can only update your own profile' });
//     }
  
//     next();  // Proceed to the updateProfile controller if the user owns the profile
//   }, ClientController.updateProfile);

router.put('/profile', authenticate, upload, ClientController.updateProfile);

  // Admin route to update client status
router.put('/:id/status', authenticate, authorizeAdmin, ClientController.updateClientStatus);

// Route for logged-in client to get their own profile (authentication required)
router.get('/profile', authenticate, ClientController.getClient);

// Route for users to change their password
router.put('/change-password', authenticate, ClientController.changePassword);

module.exports = router;
