const express = require("express");
const router = express.Router();
const { initializePayment, verifyPayment } = require("../controllers/paymentController"); // Ensure both functions are imported

router.get("/verify-payment", verifyPayment);
router.post("/initialize-payment", initializePayment); // Add this line

module.exports = router;
