// const express = require('express');
// const TransactionController = require('../controllers/TransactionController');

// const router = express.Router();

// router.post('/initialize-payment', TransactionController.initializePayment);
// router.get('/verify-payment', TransactionController.verifyPayment);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { createTransaction, getAllTransactions, getTransactionById } = require("../controllers/TransactionController");

router.post("/create", createTransaction);
router.get("/", getAllTransactions);
router.get("/:id", getTransactionById);

module.exports = router;
