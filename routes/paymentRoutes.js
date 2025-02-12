const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware"); 

const { initializePayment, verifyPayment } = require("../controllers/paymentController"); // Correct import

router.get("/verify-payment", verifyPayment);
router.post("/initialize-payment", authenticate, initializePayment); // Use the correctly imported function

module.exports = router;
