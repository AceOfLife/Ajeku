const express = require('express');
const router = express.Router();
const clientRoutes = require('./clientRoutes');
const messageRoutes = require('./messageRoutes');
const { Client } = require('../models'); 

// Import the controllers
const ClientController = require('../controllers/ClientController');
const AgentController = require('../controllers/AgentController');
const PropertyController = require('../controllers/PropertyController');
const TransactionController = require('../controllers/TransactionController');
const MessageController = require('../controllers/MessageController');
const ReviewController = require('../controllers/ReviewController');
const UserController = require('../controllers/UserController');
const AdminController = require('../controllers/AdminController');
// const EscrowController = require('../controllers/EscrowController');
const DocumentController = require('../controllers/documentController');
const rentalController = require('../controllers/rentalController');

// Import middleware for authentication and authorization
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../config/multerConfig'); 


// Import the Bank of Heaven Routes
const bankOfHeavenRoutes = require('./bankOfHeavenRoutes');

// Admin route to update profile (admin can update their own profile)
router.put('/profile', authenticate, authorizeAdmin, upload, AdminController.updateProfile);

// Admin route to get profile info
router.get('/profile', authenticate, authorizeAdmin, AdminController.getProfile);

// Admin route to change password
router.put('/change-password', authenticate, authorizeAdmin, AdminController.changePassword);

// Client routes
router.get('/clients', authenticate, authorizeAdmin, ClientController.getAllClients);
// router.post('/clients', authenticate, authorizeAdmin, ClientController.createClient);
// router.put('/clients/:id', authenticate, authorizeAdmin, ClientController.updateClient);
router.get('/clients/:id', authenticate, (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  
  // Fetch the client first
  Client.findByPk(req.params.id).then(client => {
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (isAdmin || req.user.id === client.user_id) {
      req.client = client; // Pass client forward if needed
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching client', error: err.message });
  });
}, ClientController.getClient);

router.delete('/clients/:id', authenticate, authorizeAdmin, ClientController.deleteClient);
// router.use('/clients', clientRoutes);

// Agent routes
router.get('/agents', authenticate, AgentController.getAllAgents);
router.post('/agents', authenticate, authorizeAdmin, AgentController.createAgent);
router.put('/agents/:id', authenticate, authorizeAdmin, AgentController.updateAgent);
router.delete('/agents/:id', authenticate, authorizeAdmin, AgentController.deleteAgent);

// Property routes
router.get('/properties', authenticate, PropertyController.getAllProperties);
router.get('/properties/filter', authenticate, PropertyController.getFilteredProperties);
// router.get('/rental-bookings', authenticate, authorizeAdmin, rentalController.getAllRentalBookings);
router.post('/properties', authenticate, authorizeAdmin, PropertyController.createProperty); // Admin-only route
router.put('/properties/:id', authenticate, authorizeAdmin, PropertyController.updateProperty);
router.delete('/properties/:id', authenticate, authorizeAdmin, PropertyController.deleteProperty);
router.get('/properties/:id', PropertyController.getPropertyById);
router.post('/properties/:id/monthly-expense', authenticate, authorizeAdmin, PropertyController.updateMonthlyExpense);
router.put('/properties/:id/estimated-value', authenticate, authorizeAdmin, PropertyController.updateEstimatedValue);



// Route for Fetching Property Slots
router.get('/properties/:property_id/slots', authenticate, PropertyController.getPropertySlots);  

// Transaction routes
router.get("/transactions/revenue", authenticate, authorizeAdmin, TransactionController.getRevenueStats);
router.get("/customer-map", authenticate, authorizeAdmin, TransactionController.getCustomerMap);
router.get("/transactions/recent-customers", authenticate, authorizeAdmin, TransactionController.getRecentCustomers);
router.get("/transactions/history", authenticate, authorizeAdmin, TransactionController.getTransactionHistory);
router.get('/transactions', authenticate, TransactionController.getAllTransactions);
router.get("/transactions/:id", authenticate, authorizeAdmin, TransactionController.getTransactionById);
router.post('/transactions', authenticate, authorizeAdmin, TransactionController.createTransaction);
router.put('/transactions/:id', authenticate, authorizeAdmin, TransactionController.updateTransaction);
router.delete('/transactions/:id', authenticate, authorizeAdmin, TransactionController.deleteTransaction);


// Escrow Routes
// router.post('/initiate', authenticate, EscrowController.initiateEscrowPayment);
// router.put('/approve/:transaction_id', authenticate, authorizeAdmin, EscrowController.approveEscrowPayment);
// router.put('/release/:transaction_id', authenticate, authorizeAdmin, EscrowController.releaseEscrowFunds);


// Message routes
// router.get('/messages', authenticate, MessageController.getAllMessages);
// router.post('/messages', authenticate, MessageController.createMessage);
// router.put('/messages/:id', authenticate, MessageController.updateMessage);
// router.delete('/messages/:id', authenticate, MessageController.deleteMessage);
router.use('/messages', messageRoutes);

// Review routes
router.get('/reviews', authenticate, ReviewController.getAllReviews);
router.post('/reviews', authenticate, ReviewController.createReview);
router.put('/reviews/:id', authenticate, ReviewController.updateReview);
router.delete('/reviews/:id', authenticate, authorizeAdmin, ReviewController.deleteReview);

// Get Stats Routes
router.get('/stats/summary', authenticate, authorizeAdmin, AdminController.getAdminStats);
router.get('/stats/referrals', authenticate, authorizeAdmin, AdminController.getReferralStats);

// Routes for Goals
router.post('/sales-goals', authenticate, authorizeAdmin, AdminController.setSalesGoals);
router.get('/sales-goals/progress', authenticate, authorizeAdmin, AdminController.getSalesGoalsProgress);


// User signup route (no authentication required for signup)
router.post('/signup', UserController.createUser);

// Admin-only user creation route (requires authentication)
router.post('/users', authenticate, authorizeAdmin, UserController.createUser);

// Verify Identification Documents
router.patch('/documents/verify/:documentId', 
  authenticate, 
  authorizeAdmin,
  DocumentController.verifyDocument
);

module.exports = router;
