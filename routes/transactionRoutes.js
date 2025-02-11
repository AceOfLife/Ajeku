const express = require('express');
const TransactionController = require('../controllers/TransactionController');

const router = express.Router();

router.post('/initialize-payment', TransactionController.initializePayment);
router.get('/verify-payment', TransactionController.verifyPayment);

module.exports = router;