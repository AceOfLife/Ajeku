const axios = require("axios");
const Property = require("../models/property.js"); 

exports.verifyPayment = async (req, res) => {
    const { reference, propertyId } = req.query; 

    if (!reference || !propertyId) {
        return res.status(400).json({ message: "Reference and Property ID are required" });
    }

    try {
        // Make request to PayStack API to verify the transaction
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });

        const paymentData = response.data;

        if (paymentData.data.status === "success") {
            // Update property status to rented
            await Property.update({ is_rented: true }, { where: { id: propertyId } });

            return res.status(200).json({
                message: "Payment verified successfully",
                data: paymentData.data,
            });
        } else {
            return res.status(400).json({ message: "Payment verification failed", data: paymentData.data });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
