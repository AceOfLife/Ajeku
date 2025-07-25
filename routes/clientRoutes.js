const express = require('express');
const router = express.Router();
const { Client } = require('../models');
const ClientController = require('../controllers/ClientController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../config/multerConfig');
const PropertyController = require('../controllers/PropertyController');
const NotificationController = require('../controllers/NotificationController');
const RelistController = require('../controllers/RelistController');

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
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'For clients only' });
    }

    // Fetch clientId if not in token
    const clientId = req.user.clientId || (await Client.findOne({ 
      where: { user_id: req.user.id },
      attributes: ['id']
    }))?.id;

    if (!clientId) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    req.params = { id: clientId };
    return ClientController.getClient(req, res);
  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({ message: 'Server error' });
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

// Relist
// Check relist eligibility
router.get(
  '/properties/:propertyId/can-relist', 
  authenticate, 
  RelistController.checkRelistEligibility
);

// Relist entire property
router.post(
  '/properties/:propertyId/relist', 
  authenticate, 
  RelistController.relistProperty
);

// Relist specific slots
router.post(
  '/properties/:propertyId/relist-slots', 
  authenticate, 
  RelistController.relistSlots
);

// Get Relisted properties & slots
router.get('/properties/relisted', PropertyController.getRelistedProperties);
router.get('/properties/:propertyId/relisted-slots', RelistController.getRelistedSlots);

module.exports = router;
