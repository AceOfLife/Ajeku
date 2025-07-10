const axios = require('axios');
const {
  Transaction,
  Property,
  User,
  FractionalOwnership,
  InstallmentOwnership,
  InstallmentPayment,
  PropertyImage,
  Notification
} = require('../models');


exports.initializePayment = async (req, res) => {
  try {
    const { user_id, property_id, payment_type, slots = 1 } = req.body;

    // Fetch the user
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch the property
    const property = await Property.findByPk(property_id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    let amount = property.price;

    // Outright or per-slot payment
    if (payment_type === "fractional" && property.is_fractional) {
      if (!property.price_per_slot || !property.fractional_slots) {
        return res.status(400).json({ message: 'Invalid fractional property setup' });
      }

      if (slots > property.fractional_slots) {
        return res.status(400).json({ message: 'Not enough fractional slots available' });
      }

      amount = property.price_per_slot * slots;
    }

    // Standard Installment (Non-fractional)
    else if (payment_type === "installment" && property.isInstallment) {
      if (property.is_fractional) {
        // Fractional with part-payment logic
        if (!property.price_per_slot || !property.fractional_slots) {
          return res.status(400).json({ message: 'Invalid fractional installment setup' });
        }

        if (slots > property.fractional_slots) {
          return res.status(400).json({ message: 'Not enough fractional slots available' });
        }

        amount = property.price_per_slot * slots; // Full slot cost
      } else {
        // Standard monthly installment logic
        if (!property.duration || property.duration <= 0) {
          return res.status(400).json({ message: 'Invalid installment setup' });
        }

        amount = property.price / property.duration;
      }
    }

    // ✅ NEW: Fractional Installment Logic
    else if (payment_type === "fractionalInstallment" && property.is_fractional && property.isFractionalInstallment) {
      if (!property.price_per_slot || !property.isFractionalDuration || !property.fractional_slots) {
        return res.status(400).json({ message: 'Invalid fractional installment duration setup' });
      }

      if (slots > property.fractional_slots) {
        return res.status(400).json({ message: 'Not enough fractional slots available' });
      }

      amount = (property.price_per_slot * slots) / property.isFractionalDuration;
    }

    // Convert amount to kobo
    const amountInKobo = Math.round(amount * 100);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: amountInKobo,
        currency: "NGN",
        callback_url: `https://ajeku-developing.vercel.app/payment-success?propertyId=${property.id}`,
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
    console.error("Payment Initialization Error:", error.response?.data || error.message);
    res.status(500).json({ message: 'Error initializing payment', error });
  }
};


// Updated with isFractionalInstallment 18th June

// exports.verifyPayment = async (req, res) => {
//   try {
//     const { reference } = req.query;
//     if (!reference) return res.status(400).json({ message: "Transaction reference is required" });

//     const existingTransaction = await Transaction.findOne({ where: { reference } });
//     if (existingTransaction) {
//       return res.status(200).json({
//         message: "The Payment has been verified already",
//         transaction: existingTransaction
//       });
//     }

//     const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json"
//       }
//     });

//     const paymentData = response.data.data;
//     if (paymentData.status !== "success") {
//       return res.status(400).json({
//         message: "Payment not successful",
//         status: paymentData.status,
//         gateway_response: paymentData.gateway_response
//       });
//     }

//     const { user_id, property_id, payment_type, slots = 1 } = paymentData.metadata || {};
//     if (!user_id || !property_id || !payment_type) {
//       return res.status(400).json({ message: "Incomplete payment metadata" });
//     }

//     const user = await User.findByPk(user_id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const property = await Property.findByPk(property_id);
//     if (!property) return res.status(404).json({ message: "Property not found" });

//     const transaction = await Transaction.create({
//       user_id,
//       property_id,
//       reference,
//       price: paymentData.amount / 100,
//       currency: paymentData.currency,
//       status: paymentData.status,
//       transaction_date: new Date(paymentData.transaction_date),
//       payment_type
//     });

//     // ===== FRACTIONAL SLOT PURCHASE =====
//     if (payment_type === "fractional" && property.is_fractional) {
//       if (slots > property.fractional_slots) {
//         return res.status(400).json({ message: 'Not enough fractional slots available (post-payment)' });
//       }

//       await FractionalOwnership.create({
//         user_id,
//         property_id,
//         slots_purchased: slots
//       });

//       property.fractional_slots -= slots;
//       await property.save();

//       return res.status(200).json({
//         message: "Fractional payment verified successfully",
//         transaction,
//         slotsPurchased: slots,
//         availableSlots: property.fractional_slots
//       });
//     }

//     // ===== FRACTIONAL INSTALLMENT (slot part-payment) =====
//     if (payment_type === "fractional_installment" && property.is_fractional && property.isFractionalInstallment) {
//       let ownership = await InstallmentOwnership.findOne({
//         where: { user_id, property_id }
//       });

//       if (!ownership) {
//         ownership = await InstallmentOwnership.create({
//           user_id,
//           property_id,
//           start_date: new Date(),
//           total_months: null,       // Undefined in this model
//           months_paid: null,
//           status: "incomplete"
//         });
//       }

//       await InstallmentPayment.create({
//         ownership_id: ownership.id,
//         user_id,
//         property_id,
//         amount_paid: paymentData.amount / 100,
//         payment_month: null,
//         payment_year: null
//       });

//       return res.status(200).json({
//         message: "Fractional installment payment recorded successfully",
//         transaction
//       });
//     }

//     // ===== STANDARD INSTALLMENT (monthly) =====
//     if (payment_type === "installment" && property.isInstallment && !property.is_fractional) {
//       const totalMonths = parseInt(property.duration);
//       const today = new Date();
//       const month = today.getMonth() + 1;
//       const year = today.getFullYear();

//       let ownership = await InstallmentOwnership.findOne({
//         where: { user_id, property_id }
//       });

//       if (!ownership) {
//         ownership = await InstallmentOwnership.create({
//           user_id,
//           property_id,
//           start_date: today,
//           total_months: totalMonths,
//           months_paid: 1,
//           status: totalMonths === 1 ? "completed" : "ongoing"
//         });
//       } else {
//         ownership.months_paid += 1;
//         if (ownership.months_paid >= totalMonths) {
//           ownership.status = "completed";
//         }
//         await ownership.save();
//       }

//       await InstallmentPayment.create({
//         ownership_id: ownership.id,
//         user_id,
//         property_id,
//         amount_paid: paymentData.amount / 100,
//         payment_month: month,
//         payment_year: year
//       });

//       return res.status(200).json({
//         message: "Installment payment verified successfully",
//         transaction,
//         monthsPaid: ownership.months_paid,
//         monthsRemaining: ownership.total_months - ownership.months_paid,
//         status: ownership.status
//       });
//     }

//     return res.status(200).json({
//       message: "Payment verified, but no specific ownership type was processed",
//       transaction
//     });

//   } catch (error) {
//     console.error("Payment Verification Error:", error.response ? error.response.data : error.message);
//     return res.status(500).json({ message: "Error verifying payment", error: error.message });
//   }
// };

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ message: "Transaction reference is required" });

    const existingTransaction = await Transaction.findOne({ where: { reference } });
    if (existingTransaction) {
      return res.status(200).json({
        message: "The Payment has been verified already",
        transaction: existingTransaction
      });
    }

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

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const property = await Property.findByPk(property_id);
    if (!property) return res.status(404).json({ message: "Property not found" });

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

    // Helper: compute available slots dynamically
    const getAvailableFractionalSlots = async (propertyId) => {
      const ownerships = await FractionalOwnership.findAll({ where: { property_id: propertyId } });
      const totalPurchased = ownerships.reduce((sum, o) => sum + o.slots_purchased, 0);
      return property.fractional_slots - totalPurchased;
    };

    // === FRACTIONAL OUTRIGHT PAYMENT ===
    if (payment_type === "fractional" && property.is_fractional) {
      const availableSlots = await getAvailableFractionalSlots(property.id);
      if (slots > availableSlots) {
        return res.status(400).json({ message: 'Not enough fractional slots available (post-payment)' });
      }

      await FractionalOwnership.create({
        user_id,
        property_id,
        slots_purchased: slots
      });

      return res.status(200).json({
        message: "Fractional payment verified successfully",
        transaction,
        slotsPurchased: slots,
        availableSlots: availableSlots - slots
      });
    }

    // === FRACTIONAL INSTALLMENT (monthly payment on slots) ===
    if (payment_type === "fractionalInstallment" && property.is_fractional && property.isFractionalInstallment) {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      let ownership = await InstallmentOwnership.findOne({
        where: { user_id, property_id }
      });

      if (!ownership) {
        // First time payment — check availability before reserving
        const availableSlots = await getAvailableFractionalSlots(property.id);
        if (slots > availableSlots) {
          return res.status(400).json({ message: 'Not enough fractional slots available (post-payment)' });
        }

        // Create ownership & reserve slot
        ownership = await InstallmentOwnership.create({
          user_id,
          property_id,
          start_date: today,
          total_months: property.isFractionalDuration,
          months_paid: 1,
          status: property.isFractionalDuration === 1 ? "completed" : "ongoing"
        });

        await FractionalOwnership.create({
          user_id,
          property_id,
          slots_purchased: slots
        });

      } else {
        // Continuing monthly installment (slot already reserved)
        ownership.months_paid += 1;
        if (ownership.months_paid >= ownership.total_months) {
          ownership.status = "completed";
        }
        await ownership.save();
      }

      await InstallmentPayment.create({
        ownership_id: ownership.id,
        user_id,
        property_id,
        amount_paid: paymentData.amount / 100,
        payment_month: month,
        payment_year: year
      });

      const availableSlots = await getAvailableFractionalSlots(property.id);

      return res.status(200).json({
        message: "Fractional installment payment verified successfully",
        transaction,
        monthsPaid: ownership.months_paid,
        monthsRemaining: ownership.total_months - ownership.months_paid,
        status: ownership.status,
        availableSlots
      });
    }

    // === STANDARD INSTALLMENT (non-fractional) ===
    if (payment_type === "installment" && property.isInstallment && !property.is_fractional) {
      const totalMonths = parseInt(property.duration);
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      let ownership = await InstallmentOwnership.findOne({
        where: { user_id, property_id }
      });

      if (!ownership) {
        ownership = await InstallmentOwnership.create({
          user_id,
          property_id,
          start_date: today,
          total_months: totalMonths,
          months_paid: 1,
          status: totalMonths === 1 ? "completed" : "ongoing"
        });
      } else {
        ownership.months_paid += 1;
        if (ownership.months_paid >= totalMonths) {
          ownership.status = "completed";
        }
        await ownership.save();
      }

      await InstallmentPayment.create({
        ownership_id: ownership.id,
        user_id,
        property_id,
        amount_paid: paymentData.amount / 100,
        payment_month: month,
        payment_year: year
      });

      return res.status(200).json({
        message: "Installment payment verified successfully",
        transaction,
        monthsPaid: ownership.months_paid,
        monthsRemaining: ownership.total_months - ownership.months_paid,
        status: ownership.status
      });
    }

    // Default case
    return res.status(200).json({
      message: "Payment verified, but no specific ownership type was processed",
      transaction
    });

  } catch (error) {
    console.error("Payment Verification Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Error verifying payment", error: error.message });
  }
};



// Get installment status for a specific property
exports.getInstallmentStatus = async (req, res) => {
  try {
    const { userId, propertyId } = req.params;

    const ownership = await InstallmentOwnership.findOne({
      where: { user_id: userId, property_id: propertyId }
    });

    if (!ownership) {
      return res.status(404).json({ message: "No installment ownership found for this user & property" });
    }

    const payments = await InstallmentPayment.findAll({
      where: { user_id: userId, property_id: propertyId },
      order: [['payment_date', 'ASC']]
    });

    return res.status(200).json({
      ownership,
      payments,
      months_paid: ownership.months_paid,
      months_remaining: ownership.months_remaining,
      total_months: ownership.total_months
    });

  } catch (error) {
    console.error("Error fetching installment status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all installments for a user
exports.getUserInstallments = async (req, res) => {
  try {
    const { userId } = req.params;

    const ownerships = await InstallmentOwnership.findAll({
      where: { user_id: userId },
      include: ['property']
    });

    return res.status(200).json({ ownerships });

  } catch (error) {
    console.error("Error fetching user installments:", error);
    res.status(500).json({ message: "Server error", error });
  }
};