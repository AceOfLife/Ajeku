const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware"); 

const { initializePayment, verifyPayment, getInstallmentStatus, getUserInstallments } = require("../controllers/paymentController"); // Correct import

router.get("/verify-payment", verifyPayment);
router.post("/initialize-payment", authenticate, initializePayment); // Use the correctly imported function

router.get("/installment-status/:userId/:propertyId", authenticate, getInstallmentStatus);
router.get("/my-installments/:userId", authenticate, getUserInstallments);

module.exports = router;
