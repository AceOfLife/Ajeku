const axios = require('axios');
const { Transaction, Property, User, Client } = require('../models');

// exports.initializePayment = async (req, res) => {
//     try {
//         console.log("Request Body:", req.body);
//         const { user_id, property_id, payment_type } = req.body;

//         // Validate user
//         const user = await User.findByPk(user_id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Validate property
//         const property = await Property.findByPk(property_id);
//         if (!property) {
//             return res.status(404).json({ message: 'Property not found' });
//         }

//         let amount = property.price; // Default to full price

//         // Adjust price if fractional
//         if (payment_type === "fractional" && property.is_fractional) {
//             amount = property.price_per_slot;
//         }

//         // Convert amount to kobo (PayStack requires amount in kobo)
//         const amountInKobo = amount * 100;

//         // Initialize payment with PayStack
//         const response = await axios.post(
//             "https://api.paystack.co/transaction/initialize",
//             {
//                 email: user.email, // Fetch from user data
//                 amount: amountInKobo,
//                 currency: "NGN",
//                 callback_url: `https://ajeku-mu.vercel.app/payment-success?propertyId=${property.id}`,
//                 metadata: {
//                     user_id: user.id,
//                     property_id: property.id,
//                     payment_type: payment_type,
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         res.status(200).json({ paymentUrl: response.data.data.authorization_url, reference: response.data.data.reference });
//     } catch (error) {
//         console.error("Payment Initialization Error:", error.response ? error.response.data : error.message);
//         res.status(500).json({ message: 'Error initializing payment', error });
//     }
// };

// exports.verifyPayment = async (req, res) => {
//     try {
//         const { reference } = req.query;

//         if (!reference) {
//             return res.status(400).json({ message: "Transaction reference is required" });
//         }

//         // Verify payment with Paystack
//         const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//             headers: {
//                 Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//                 "Content-Type": "application/json"
//             }
//         });

//         // Ensure Paystack's response is valid
//         if (!response.data || !response.data.data) {
//             return res.status(500).json({ message: "Invalid response from payment gateway" });
//         }

//         const paymentData = response.data.data;

//         // Check if payment was successful
//         if (paymentData.status !== "success") {
//             return res.status(400).json({
//                 message: "Payment not successful",
//                 status: paymentData.status,
//                 gateway_response: paymentData.gateway_response
//             });
//         }

//         // Debug metadata
//         console.log("Payment Metadata:", paymentData.metadata);

//         // Ensure metadata exists before extracting values
//         const metadata = paymentData.metadata || {};
//         const { user_id, property_id, payment_type } = metadata;

//         if (!user_id) {
//             return res.status(400).json({ message: "User ID is missing in payment metadata" });
//         }
//         if (!property_id) {
//             return res.status(400).json({ message: "Property ID is missing in payment metadata" });
//         }
//         if (!payment_type) {
//             return res.status(400).json({ message: "Payment type is missing in payment metadata" });
//         }

//         // Fetch the user
//         const user = await User.findOne({ where: { id: user_id } });

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Save the transaction in your database
//         const transaction = await Transaction.create({
//             user_id,
//             property_id,
//             reference,
//             price: paymentData.amount / 100, // Convert from kobo to Naira
//             currency: paymentData.currency,
//             status: paymentData.status,
//             transaction_date: new Date(paymentData.transaction_date),
//             payment_type
//         });

//         return res.status(200).json({
//             message: "Payment verified successfully",
//             transaction
//         });

//     } catch (error) {
//         console.error("Payment Verification Error:", error.response ? error.response.data : error.message);
//         return res.status(500).json({ message: "Error verifying payment", error: error.message });
//     }
// };


// 11/04/2025

const axios = require('axios');
const { Transaction, Property, User, FractionalOwnership } = require('../models');

exports.initializePayment = async (req, res) => {
  try {
    const { user_id, property_id, payment_type, slots = 1 } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const property = await Property.findByPk(property_id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    let amount = property.price;

    if (payment_type === "fractional" && property.is_fractional) {
      if (!property.price_per_slot || !property.fractional_slots) {
        return res.status(400).json({ message: 'Invalid fractional property setup' });
      }

      if (slots > property.fractional_slots) {
        return res.status(400).json({ message: 'Not enough fractional slots available' });
      }

      amount = property.price_per_slot * slots;
    }

    const amountInKobo = amount * 100;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: amountInKobo,
        currency: "NGN",
        callback_url: `https://ajeku-mu.vercel.app/payment-success?propertyId=${property.id}`,
        metadata: {
          user_id: user.id,
          property_id: property.id,
          payment_type,
          slots
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({
      paymentUrl: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error("Payment Initialization Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error initializing payment', error });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ message: "Transaction reference is required" });

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const paymentData = response.data.data;
    if (paymentData.status !== "success") {
      return res.status(400).json({
        message: "Payment not successful",
        status: paymentData.status,
        gateway_response: paymentData.gateway_response
      });
    }

    const { user_id, property_id, payment_type, slots = 1 } = paymentData.metadata || {};
    if (!user_id || !property_id || !payment_type) {
      return res.status(400).json({ message: "Incomplete payment metadata" });
    }

    const user = await User.findOne({ where: { id: user_id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const property = await Property.findByPk(property_id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Save transaction
    const transaction = await Transaction.create({
      user_id,
      property_id,
      reference,
      price: paymentData.amount / 100,
      currency: paymentData.currency,
      status: paymentData.status,
      transaction_date: new Date(paymentData.transaction_date),
      payment_type
    });

    // Handle fractional ownership update
    if (payment_type === "fractional" && property.is_fractional) {
      if (slots > property.fractional_slots) {
        return res.status(400).json({ message: 'Not enough fractional slots available (post-payment)' });
      }

      // Save fractional ownership
      await FractionalOwnership.create({
        user_id,
        property_id,
        slots_purchased: slots
      });

      // Update property slot count
      property.fractional_slots -= slots;
      await property.save();
    }

    return res.status(200).json({
      message: "Payment verified successfully",
      transaction,
      slotsPurchased: slots,
      availableSlots: property.fractional_slots
    });

  } catch (error) {
    console.error("Payment Verification Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Error verifying payment", error: error.message });
  }
};
