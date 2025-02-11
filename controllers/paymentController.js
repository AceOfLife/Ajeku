const axios = require("axios");
const { Transaction, Property, Client } = require("../models");

exports.verifyPayment = async (req, res) => {
    const { reference } = req.query;

    if (!reference) {
        return res.status(400).json({ message: "Payment reference is required" });
    }

    try {
        // Verify payment with Paystack
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        const paymentData = response.data.data;

        if (paymentData.status !== "success") {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        // Extract details from Paystack response
        const clientEmail = paymentData.customer.email; // Assuming email is used to identify clients
        const amountPaid = paymentData.amount / 100; // Convert from kobo to NGN
        const propertyId = paymentData.metadata.property_id; // Ensure metadata contains property_id
        const paymentType = paymentData.metadata.payment_type; // rental, outright, fractional

        // Find the client using their email
        const client = await Client.findOne({ where: { email: clientEmail } });
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        // Check if the transaction already exists
        let existingTransaction = await Transaction.findOne({ where: { id: reference } });

        if (!existingTransaction) {
            // Create new transaction entry
            existingTransaction = await Transaction.create({
                id: reference, // Use Paystack transaction reference as ID
                client_id: client.id,
                property_id: propertyId,
                price: amountPaid,
                status: "successful",
                transaction_date: new Date(),
            });

            // Optionally update the property status
            await Property.update({ status: "rented" }, { where: { id: propertyId } });
        }

        return res.status(200).json({ message: "Payment verified", transaction: existingTransaction });
    } catch (error) {
        console.error("Error verifying payment:", error.response ? error.response.data : error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
