const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../config/multerConfig');
const PropertyController = require('../controllers/PropertyController');
const NotificationController = require('../controllers/NotificationController');

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
router.get('/profile', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'client') {
      if (!req.user.clientId) {
        return res.status(403).json({
          message: 'No client profile associated with this account'
        });
      }
      req.params = { id: req.user.clientId };
      return ClientController.getClient(req, res);
    }
    
    return res.status(403).json({
      message: 'This endpoint is for client profiles only'
    });
  } catch (error) {
    console.error('Error in profile route:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Route for users to change their password
router.put('/change-password', authenticate, ClientController.changePassword);

// Get Recent Properties
router.get('/properties/recent', PropertyController.getRecentProperties);

// Top 6 most viewed properties
router.get('/properties/most-viewed', PropertyController.getMostViewedProperties);

// User properties
router.get('/properties/user', authenticate, PropertyController.getUserProperties);
router.get('/property-analytics/:propertyId', authenticate, PropertyController.getPropertyAnalytics);
router.get('/analytics/top-performing', authenticate, PropertyController.getTopPerformingProperty);
router.get('/users/:userId/analytics', authenticate, PropertyController.getUserPropertiesAnalytics);

// Notification
router.post('/notifications', authenticate, NotificationController.createNotification);
router.get('/notifications', authenticate, NotificationController.getUserNotifications);
router.put('/notifications/:id/read', authenticate, NotificationController.markAsRead);


module.exports = router;
