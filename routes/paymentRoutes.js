const express = require("express");
const router = express.Router();
const { verifyPayment } = require("../controllers/paymentController");

router.get("/verify-payment", verifyPayment);

module.exports = router;
