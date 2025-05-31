// const express = require("express");
// const router = express.Router();
// const { createTransaction, getAllTransactions, getTransactionById } = require("../controllers/TransactionController");

// router.post("/create", createTransaction);
// router.get("/", getAllTransactions);
// router.get("/:id", getTransactionById);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getUserTransactionHistory,
} = require("../controllers/TransactionController");

const { authenticate, authorizeAdmin } = require("../middlewares/authMiddleware");

// User's personal transaction history
router.get("/my-history", authenticate, getUserTransactionHistory);

// Existing routes
router.post("/create", createTransaction);
router.get("/", authorizeAdmin, getAllTransactions); // Assuming only admin can see all
router.get("/:id", getTransactionById);

module.exports = router;

