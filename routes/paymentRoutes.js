// const express = require("express");
// const router = express.Router();
// const { authenticate } = require("../middleware/authMiddleware"); 

// const { initializePayment, verifyPayment } = require("../controllers/paymentController"); // Ensure both functions are imported

// router.get("/verify-payment", verifyPayment);
// // router.post("/initialize-payment", initializePayment); // Add this line
// router.post('/initialize-payment', authenticate, PaymentController.initializePayment);


// module.exports = router;


// New 

const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware"); 

const { initializePayment, verifyPayment } = require("../controllers/paymentController"); // Correct import

router.get("/verify-payment", verifyPayment);
router.post("/initialize-payment", authenticate, initializePayment); // Use the correctly imported function

module.exports = router;
