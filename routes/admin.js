const express = require('express');
const router = express.Router();

// Import the controllers
const ClientController = require('../controllers/ClientController');
const AgentController = require('../controllers/AgentController');
const PropertyController = require('../controllers/PropertyController');
const TransactionController = require('../controllers/TransactionController');
const MessageController = require('../controllers/MessageController');
const ReviewController = require('../controllers/ReviewController');
const UserController = require('../controllers/UserController');

// Import middleware for authentication and authorization
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// Client routes
router.get('/clients', authenticate, ClientController.getAllClients);
router.post('/clients', authenticate, authorizeAdmin, ClientController.createClient);
router.put('/clients/:id', authenticate, authorizeAdmin, ClientController.updateClient);
router.delete('/clients/:id', authenticate, authorizeAdmin, ClientController.deleteClient);

// Agent routes
router.get('/agents', authenticate, AgentController.getAllAgents);
router.post('/agents', authenticate, authorizeAdmin, AgentController.createAgent);
router.put('/agents/:id', authenticate, authorizeAdmin, AgentController.updateAgent);
router.delete('/agents/:id', authenticate, authorizeAdmin, AgentController.deleteAgent);

// Property routes
router.get('/properties', authenticate, PropertyController.getAllProperties);
router.post('/properties', authenticate, authorizeAdmin, PropertyController.createProperty); // Admin-only route
router.put('/properties/:id', authenticate, authorizeAdmin, PropertyController.updateProperty);
router.delete('/properties/:id', authenticate, authorizeAdmin, PropertyController.deleteProperty);
router.get('/properties/:id', PropertyController.getPropertyById);

// Transaction routes
router.get('/transactions', authenticate, TransactionController.getAllTransactions);
router.post('/transactions', authenticate, authorizeAdmin, TransactionController.createTransaction);
router.put('/transactions/:id', authenticate, authorizeAdmin, TransactionController.updateTransaction);
router.delete('/transactions/:id', authenticate, authorizeAdmin, TransactionController.deleteTransaction);

// Message routes
router.get('/messages', authenticate, MessageController.getAllMessages);
router.post('/messages', authenticate, MessageController.createMessage);
router.put('/messages/:id', authenticate, MessageController.updateMessage);
router.delete('/messages/:id', authenticate, MessageController.deleteMessage);

// Review routes
router.get('/reviews', authenticate, ReviewController.getAllReviews);
router.post('/reviews', authenticate, ReviewController.createReview);
router.put('/reviews/:id', authenticate, ReviewController.updateReview);
router.delete('/reviews/:id', authenticate, authorizeAdmin, ReviewController.deleteReview);

// User signup route (no authentication required for signup)
router.post('/signup', UserController.createUser);

// Admin-only user creation route (requires authentication)
router.post('/users', authenticate, authorizeAdmin, UserController.createUser);

module.exports = router;
