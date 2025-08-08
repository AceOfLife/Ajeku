const axios = require('axios');
const {
  Transaction,
  Property,
  User,
  FractionalOwnership,
  InstallmentOwnership,
  InstallmentPayment,
  PropertyImage,
  Notification,
  Sequelize,
  sequelize,
  RentalBooking
} = require('../models');

exports.initializePayment = async (req, res) => {
  try {
    const { user_id, property_id, payment_type, slots = 1, rooms = 1 } = req.body;

    // 1. Fetch User
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Fetch Property
    const property = await Property.findByPk(property_id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // 3. Handle Rental Availability Check (TRANSACTION REMOVED)
    if (payment_type === "rental" && property.isRental) {
      if (!property.annual_rent || property.annual_rent <= 0) {
        return res.status(400).json({ message: 'Annual rent must be set for rental properties' });
      }

      // Simplified check without transaction
      const totalBooked = await RentalBooking.sum('rooms_booked', {
        where: { property_id: property.id }
      }) || 0;

      const availableRooms = property.number_of_rooms - totalBooked;
      const roomsRequested = parseInt(rooms) || 1;

      if (availableRooms < roomsRequested) {
        return res.status(400).json({ 
          message: `Only ${availableRooms} room(s) available - booking rejected`,
          availableRooms
        });
      }
    }

    // 4. Calculate Amount Based on Payment Type
    let amount = property.price;

    // Fractional Outright Payment
    if (payment_type === "fractional" && property.is_fractional) {
      if (!property.price_per_slot || !property.fractional_slots) {
        return res.status(400).json({ message: 'Invalid fractional property setup' });
      }
      if (slots > property.fractional_slots) {
        return res.status(400).json({ message: 'Not enough fractional slots available' });
      }
      amount = property.price_per_slot * slots;
    }
    // Standard Installment
    else if (payment_type === "installment" && property.isInstallment) {
      if (property.is_fractional) {
        if (!property.price_per_slot || !property.fractional_slots) {
          return res.status(400).json({ message: 'Invalid fractional installment setup' });
        }
        if (slots > property.fractional_slots) {
          return res.status(400).json({ message: 'Not enough fractional slots available' });
        }
        amount = property.price_per_slot * slots;
      } else {
        if (!property.duration || property.duration <= 0) {
          return res.status(400).json({ message: 'Invalid installment setup' });
        }
        amount = property.price / property.duration;
      }
    }
    // Fractional Installment
    else if (payment_type === "fractionalInstallment" && property.is_fractional && property.isFractionalInstallment) {
      if (!property.price_per_slot || !property.isFractionalDuration || !property.fractional_slots) {
        return res.status(400).json({ message: 'Invalid fractional installment duration setup' });
      }
      if (slots > property.fractional_slots) {
        return res.status(400).json({ message: 'Not enough fractional slots available' });
      }
      amount = (property.price_per_slot * slots) / property.isFractionalDuration;
    }
    // Rental Payment
    else if (payment_type === "rental" && property.isRental) {
      amount = property.annual_rent;
    }

    // 5. Initialize Payment with Paystack
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
          slots,
          rooms: parseInt(rooms) || 1
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
    console.error("Payment Initialization Error:", {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    res.status(500).json({ 
      message: "Error initializing payment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.verifyPayment = async (req, res) => {
  // Use SERIALIZABLE isolation level for stronger consistency
  const t = await sequelize.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
  });

  try {
    const { reference } = req.query;
    if (!reference) {
      await t.rollback();
      return res.status(400).json({ message: "Transaction reference is required" });
    }

    // 1. Check for existing transaction with row locking
    const existingTransaction = await Transaction.findOne({ 
      where: { reference },
      transaction: t,
      lock: t.LOCK.UPDATE,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email'] },
        { model: Property, as: 'property', attributes: ['id', 'title', 'is_sold'] }
      ]
    });
    
    if (existingTransaction) {
      await t.commit();
      return res.status(200).json({
        message: "Payment already verified",
        transaction: existingTransaction
      });
    }

    // 2. Verify with Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    const paymentData = response.data.data;
    if (paymentData.status !== "success") {
      await t.rollback();
      return res.status(400).json({
        message: "Payment not successful",
        status: paymentData.status,
        gateway_response: paymentData.gateway_response
      });
    }

    // 3. Extract and validate metadata
    const { user_id, property_id, payment_type, client_id, slots = 1, rooms = 1 } = paymentData.metadata || {};
    
    console.log('Payment Verification Metadata:', {
      user_id,
      property_id,
      payment_type,
      client_id,
      amount: paymentData.amount / 100,
      currency: paymentData.currency
    });

    if (!user_id || !payment_type) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Incomplete payment metadata",
        required_fields: {
          user_id: !user_id ? "Missing" : "Provided",
          payment_type: !payment_type ? "Missing" : "Provided"
        }
      });
    }

    // 4. Get user and property with locking
    const [user, property] = await Promise.all([
      User.findByPk(user_id, { 
        transaction: t,
        attributes: ['id', 'email', 'name'],
        lock: t.LOCK.UPDATE
      }),
      property_id ? Property.findByPk(property_id, { 
        transaction: t,
        attributes: ['id', 'title', 'is_fractional', 'isInstallment', 'isRental', 'is_sold'],
        lock: t.LOCK.UPDATE
      }) : Promise.resolve(null)
    ]);

    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    // 5. Create transaction record first
    const transaction = await Transaction.create({
      user_id,
      property_id: property_id || null,
      client_id: client_id || null,
      reference,
      price: paymentData.amount / 100,
      currency: paymentData.currency,
      status: paymentData.status,
      payment_type,
      transaction_date: new Date(paymentData.transaction_date || Date.now())
    }, { 
      transaction: t
    });

    // ========== PAYMENT TYPE SPECIFIC CHECKS ==========
    if (payment_type === "full" || payment_type === "outright") {
      if (!property) {
        await t.rollback();
        return res.status(404).json({ message: "Property not found for full payment" });
      }

      // Check for existing full ownership
      const existingFullOwnership = await FullOwnership.findOne({
        where: { property_id: property.id },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (existingFullOwnership) {
        await t.rollback();
        return res.status(400).json({
          message: "Property already has a full owner",
          existing_owner_id: existingFullOwnership.user_id
        });
      }

      // Check if property is already sold
      if (property.is_sold) {
        await t.rollback();
        return res.status(400).json({ 
          message: "Property is already sold",
          property_id: property.id
        });
      }
    }

    // ========== NOTIFICATION INTEGRATION ==========
    const io = req.app.get('socketio');

    // Client notification
    const clientNotification = await Notification.create({
      user_id,
      title: 'Payment Successful',
      message: `Your ${payment_type} payment ${property ? `for ${property.title}` : ''} was completed successfully`,
      type: 'payment',
      related_entity_id: property_id || transaction.id,
      metadata: {
        transaction_id: transaction.id,
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        reference
      }
    }, { transaction: t });

    // Admin notifications
    const admins = await User.findAll({ 
      where: { role: 'admin' },
      transaction: t,
      attributes: ['id'],
      lock: t.LOCK.UPDATE
    });

    const adminNotifications = await Promise.all(
      admins.map(admin => 
        Notification.create({
          user_id: admin.id,
          title: 'New Payment Received',
          message: `Client ${user.email} completed a ${payment_type} payment (${paymentData.currency} ${paymentData.amount/100}) ${property ? `for ${property.title}` : ''}`,
          type: 'admin_alert',
          related_entity_id: transaction.id,
          metadata: {
            user_id,
            property_id,
            payment_type,
            reference
          }
        }, { transaction: t })
      )
    );

    // ========== PAYMENT TYPE PROCESSING ==========
    const getAvailableFractionalSlots = async (propertyId) => {
      const ownerships = await FractionalOwnership.findAll({ 
        where: { property_id: propertyId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      return property.fractional_slots - ownerships.reduce((sum, o) => sum + o.slots_purchased, 0);
    };

    // FULL/OUTRIGHT PAYMENT
    if (payment_type === "full" || payment_type === "outright") {
      try {
        // Create full ownership record
        const fullOwnership = await FullOwnership.create({
          user_id,
          property_id,
          purchase_date: new Date(),
          purchase_amount: paymentData.amount / 100
        }, { 
          transaction: t 
        });

        console.log('Created FullOwnership:', fullOwnership.id);

        // Mark property as sold
        const [updatedCount] = await Property.update(
          { is_sold: true },
          { 
            where: { id: property_id }, 
            transaction: t 
          }
        );

        if (updatedCount !== 1) {
          throw new Error('Failed to update property status');
        }

        console.log('Property marked as sold:', property_id);
      } catch (err) {
        console.error('Full payment processing error:', err);
        throw err; // Will be caught by outer try-catch
      }
    } 
    // FRACTIONAL PAYMENT
    else if (payment_type === "fractional" && property?.is_fractional) {
      const availableSlots = await getAvailableFractionalSlots(property.id);
      if (slots > availableSlots) {
        await t.rollback();
        return res.status(400).json({ 
          message: 'Not enough fractional slots available',
          availableSlots,
          requestedSlots: slots
        });
      }

      await FractionalOwnership.create({
        user_id,
        property_id,
        slots_purchased: slots
      }, { transaction: t });
    }
    // FRACTIONAL INSTALLMENT
    else if (payment_type === "fractionalInstallment" && property?.is_fractional && property.isFractionalInstallment) {
      const today = new Date();
      let ownership = await InstallmentOwnership.findOne({
        where: { user_id, property_id },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!ownership) {
        const availableSlots = await getAvailableFractionalSlots(property.id);
        if (slots > availableSlots) {
          await t.rollback();
          return res.status(400).json({ 
            message: 'Not enough fractional slots available',
            availableSlots,
            requestedSlots: slots
          });
        }

        ownership = await InstallmentOwnership.create({
          user_id,
          property_id,
          start_date: today,
          total_months: property.isFractionalDuration,
          months_paid: 1,
          status: property.isFractionalDuration === 1 ? "completed" : "ongoing"
        }, { transaction: t });

        await FractionalOwnership.create({
          user_id,
          property_id,
          slots_purchased: slots
        }, { transaction: t });
      } else {
        ownership.months_paid += 1;
        if (ownership.months_paid >= ownership.total_months) {
          ownership.status = "completed";
        }
        await ownership.save({ transaction: t });
      }

      await InstallmentPayment.create({
        ownership_id: ownership.id,
        user_id,
        property_id,
        amount_paid: paymentData.amount / 100,
        payment_month: today.getMonth() + 1,
        payment_year: today.getFullYear()
      }, { transaction: t });
    }
    // STANDARD INSTALLMENT
    else if (payment_type === "installment" && property?.isInstallment && !property.is_fractional) {
      const today = new Date();
      let ownership = await InstallmentOwnership.findOne({
        where: { user_id, property_id },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!ownership) {
        ownership = await InstallmentOwnership.create({
          user_id,
          property_id,
          start_date: today,
          total_months: parseInt(property.duration),
          months_paid: 1,
          status: parseInt(property.duration) === 1 ? "completed" : "ongoing"
        }, { transaction: t });
      } else {
        ownership.months_paid += 1;
        if (ownership.months_paid >= ownership.total_months) {
          ownership.status = "completed";
        }
        await ownership.save({ transaction: t });
      }

      await InstallmentPayment.create({
        ownership_id: ownership.id,
        user_id,
        property_id,
        amount_paid: paymentData.amount / 100,
        payment_month: today.getMonth() + 1,
        payment_year: today.getFullYear()
      }, { transaction: t });
    }
    // RENTAL PAYMENT
    else if (payment_type === "rental" && property?.isRental) {
      const roomsBooked = parseInt(rooms) || 1;
      
      await RentalBooking.create({
        user_id,
        property_id,
        rooms_booked: roomsBooked,
        amount_paid: paymentData.amount / 100,
        start_date: new Date(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }, { transaction: t });

      await Property.decrement('rental_rooms', {
        by: roomsBooked,
        where: { id: property.id },
        transaction: t
      });
    }

    // Final commit
    await t.commit();

    // Real-time notifications
    if (io) {
      io.to(`user_${user_id}`).emit('new_notification', clientNotification);
      adminNotifications.forEach(notif => {
        io.to(`user_${notif.user_id}`).emit('new_notification', notif);
      });
    }

    // Response
    const responseData = {
      message: "Payment verified successfully",
      transaction: {
        id: transaction.id,
        reference: transaction.reference,
        amount: transaction.price,
        status: transaction.status,
        payment_type: transaction.payment_type,
        date: transaction.transaction_date
      },
      user: {
        id: user.id,
        email: user.email
      }
    };

    if (property) {
      responseData.property = {
        id: property.id,
        title: property.title,
        is_sold: property.is_sold
      };
    }

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Payment Verification Error:", {
      message: error.message,
      stack: error.stack,
      reference: req.query.reference,
      timestamp: new Date(),
      errorDetails: error.errors // Sequelize validation errors
    });
    
    if (!t.finished) {
      try {
        await t.rollback();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }
    
    return res.status(500).json({ 
      message: "Payment verification failed",
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.name,
        reference: req.query.reference
      } : undefined
    });
  }
};

// exports.initializePayment = async (req, res) => {
//   try {
//     const { user_id, property_id, payment_type, slots = 1 } = req.body;

//     // Fetch the user
//     const user = await User.findByPk(user_id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Fetch the property
//     const property = await Property.findByPk(property_id);
//     if (!property) return res.status(404).json({ message: 'Property not found' });

//     let amount = property.price;

//     // Outright or per-slot payment (EXISTING LOGIC - UNCHANGED)
//     if (payment_type === "fractional" && property.is_fractional) {
//       if (!property.price_per_slot || !property.fractional_slots) {
//         return res.status(400).json({ message: 'Invalid fractional property setup' });
//       }

//       if (slots > property.fractional_slots) {
//         return res.status(400).json({ message: 'Not enough fractional slots available' });
//       }

//       amount = property.price_per_slot * slots;
//     }

//     // Standard Installment (Non-fractional) (EXISTING LOGIC - UNCHANGED)
//     else if (payment_type === "installment" && property.isInstallment) {
//       if (property.is_fractional) {
//         if (!property.price_per_slot || !property.fractional_slots) {
//           return res.status(400).json({ message: 'Invalid fractional installment setup' });
//         }

//         if (slots > property.fractional_slots) {
//           return res.status(400).json({ message: 'Not enough fractional slots available' });
//         }

//         amount = property.price_per_slot * slots;
//       } else {
//         if (!property.duration || property.duration <= 0) {
//           return res.status(400).json({ message: 'Invalid installment setup' });
//         }
//         amount = property.price / property.duration;
//       }
//     }

//     // Fractional Installment Logic (EXISTING LOGIC - UNCHANGED)
//     else if (payment_type === "fractionalInstallment" && property.is_fractional && property.isFractionalInstallment) {
//       if (!property.price_per_slot || !property.isFractionalDuration || !property.fractional_slots) {
//         return res.status(400).json({ message: 'Invalid fractional installment duration setup' });
//       }

//       if (slots > property.fractional_slots) {
//         return res.status(400).json({ message: 'Not enough fractional slots available' });
//       }

//       amount = (property.price_per_slot * slots) / property.isFractionalDuration;
//     }

//     // ✅ NEW: Rental Payment Logic (ADDED SECTION)
//     else if (payment_type === "rental" && property.isRental) {
//       if (!property.annual_rent || property.annual_rent <= 0) {
//         return res.status(400).json({ message: 'Annual rent must be set for rental properties' });
//       }
//       amount = property.annual_rent;
//     }

//     // Convert amount to kobo (EXISTING LOGIC - UNCHANGED)
//     const amountInKobo = Math.round(amount * 100);

//     const response = await axios.post(
//       "https://api.paystack.co/transaction/initialize",
//       {
//         email: user.email,
//         amount: amountInKobo,
//         currency: "NGN",
//         callback_url: `https://ajeku-developing.vercel.app/payment-success?propertyId=${property.id}`,
//         metadata: {
//           user_id: user.id,
//           property_id: property.id,
//           payment_type,
//           slots
//         }
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     res.status(200).json({
//       paymentUrl: response.data.data.authorization_url,
//       reference: response.data.data.reference
//     });
//   } catch (error) {
//     console.error("Payment Initialization Error:", error.response?.data || error.message);
//     res.status(500).json({ message: 'Error initializing payment', error });
//   }
// };



// exports.verifyPayment = async (req, res) => {
//   const t = await sequelize.transaction(); // Start transaction for all operations
//   try {
//     const { reference } = req.query;
//     if (!reference) {
//       await t.rollback();
//       return res.status(400).json({ message: "Transaction reference is required" });
//     }

//     // Check for existing transaction
//     const existingTransaction = await Transaction.findOne({ 
//       where: { reference },
//       transaction: t
//     });
    
//     if (existingTransaction) {
//       await t.commit();
//       return res.status(200).json({
//         message: "The Payment has been verified already",
//         transaction: existingTransaction
//       });
//     }

//     // Verify with Paystack
//     const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json"
//       }
//     });

//     const paymentData = response.data.data;
//     if (paymentData.status !== "success") {
//       await t.rollback();
//       return res.status(400).json({
//         message: "Payment not successful",
//         status: paymentData.status,
//         gateway_response: paymentData.gateway_response
//       });
//     }

//     // Extract metadata
//     const { user_id, property_id, payment_type, slots = 1, rooms = 1 } = paymentData.metadata || {};
//     if (!user_id || !property_id || !payment_type) {
//       await t.rollback();
//       return res.status(400).json({ message: "Incomplete payment metadata" });
//     }

//     // Get user and property within transaction
//     const [user, property] = await Promise.all([
//       User.findByPk(user_id, { transaction: t }),
//       Property.findByPk(property_id, { transaction: t })
//     ]);

//     if (!user || !property) {
//       await t.rollback();
//       return res.status(404).json({ 
//         message: `${!user ? 'User' : 'Property'} not found` 
//       });
//     }

//     // Create transaction record
//     const transaction = await Transaction.create({
//       user_id,
//       property_id,
//       reference,
//       price: paymentData.amount / 100,
//       currency: paymentData.currency,
//       status: paymentData.status,
//       transaction_date: new Date(paymentData.transaction_date),
//       payment_type
//     }, { transaction: t });

//     // Helper: compute available slots dynamically
//     const getAvailableFractionalSlots = async (propertyId) => {
//       const ownerships = await FractionalOwnership.findAll({ 
//         where: { property_id: propertyId },
//         transaction: t
//       });
//       const totalPurchased = ownerships.reduce((sum, o) => sum + o.slots_purchased, 0);
//       return property.fractional_slots - totalPurchased;
//     };

//     // === FRACTIONAL OUTRIGHT PAYMENT ===
//     if (payment_type === "fractional" && property.is_fractional) {
//       const availableSlots = await getAvailableFractionalSlots(property.id);
//       if (slots > availableSlots) {
//         await t.rollback();
//         return res.status(400).json({ message: 'Not enough fractional slots available (post-payment)' });
//       }

//       await FractionalOwnership.create({
//         user_id,
//         property_id,
//         slots_purchased: slots
//       }, { transaction: t });

//       await t.commit();
//       return res.status(200).json({
//         message: "Fractional payment verified successfully",
//         transaction,
//         slotsPurchased: slots,
//         availableSlots: availableSlots - slots
//       });
//     }

//     // === FRACTIONAL INSTALLMENT ===
//     if (payment_type === "fractionalInstallment" && property.is_fractional && property.isFractionalInstallment) {
//       const today = new Date();
//       const month = today.getMonth() + 1;
//       const year = today.getFullYear();

//       let ownership = await InstallmentOwnership.findOne({
//         where: { user_id, property_id },
//         transaction: t
//       });

//       if (!ownership) {
//         const availableSlots = await getAvailableFractionalSlots(property.id);
//         if (slots > availableSlots) {
//           await t.rollback();
//           return res.status(400).json({ message: 'Not enough fractional slots available (post-payment)' });
//         }

//         ownership = await InstallmentOwnership.create({
//           user_id,
//           property_id,
//           start_date: today,
//           total_months: property.isFractionalDuration,
//           months_paid: 1,
//           status: property.isFractionalDuration === 1 ? "completed" : "ongoing"
//         }, { transaction: t });

//         await FractionalOwnership.create({
//           user_id,
//           property_id,
//           slots_purchased: slots
//         }, { transaction: t });

//       } else {
//         ownership.months_paid += 1;
//         if (ownership.months_paid >= ownership.total_months) {
//           ownership.status = "completed";
//         }
//         await ownership.save({ transaction: t });
//       }

//       await InstallmentPayment.create({
//         ownership_id: ownership.id,
//         user_id,
//         property_id,
//         amount_paid: paymentData.amount / 100,
//         payment_month: month,
//         payment_year: year
//       }, { transaction: t });

//       const availableSlots = await getAvailableFractionalSlots(property.id);

//       await t.commit();
//       return res.status(200).json({
//         message: "Fractional installment payment verified successfully",
//         transaction,
//         monthsPaid: ownership.months_paid,
//         monthsRemaining: ownership.total_months - ownership.months_paid,
//         status: ownership.status,
//         availableSlots
//       });
//     }

//     // === STANDARD INSTALLMENT ===
//     if (payment_type === "installment" && property.isInstallment && !property.is_fractional) {
//       const totalMonths = parseInt(property.duration);
//       const today = new Date();
//       const month = today.getMonth() + 1;
//       const year = today.getFullYear();

//       let ownership = await InstallmentOwnership.findOne({
//         where: { user_id, property_id },
//         transaction: t
//       });

//       if (!ownership) {
//         ownership = await InstallmentOwnership.create({
//           user_id,
//           property_id,
//           start_date: today,
//           total_months: totalMonths,
//           months_paid: 1,
//           status: totalMonths === 1 ? "completed" : "ongoing"
//         }, { transaction: t });
//       } else {
//         ownership.months_paid += 1;
//         if (ownership.months_paid >= totalMonths) {
//           ownership.status = "completed";
//         }
//         await ownership.save({ transaction: t });
//       }

//       await InstallmentPayment.create({
//         ownership_id: ownership.id,
//         user_id,
//         property_id,
//         amount_paid: paymentData.amount / 100,
//         payment_month: month,
//         payment_year: year
//       }, { transaction: t });

//       await t.commit();
//       return res.status(200).json({
//         message: "Installment payment verified successfully",
//         transaction,
//         monthsPaid: ownership.months_paid,
//         monthsRemaining: ownership.total_months - ownership.months_paid,
//         status: ownership.status
//       });
//     }

//     // === RENTAL PAYMENT (FIXED VERSION) ===
//     if (payment_type === "rental" && property.isRental) {
//       const roomsBooked = parseInt(rooms) || 1;
      
//       // Calculate actual available rooms (total - all booked)
//       const totalBooked = await RentalBooking.sum('rooms_booked', {
//         where: { property_id: property.id },
//         transaction: t
//       }) || 0;
      
//       const availableRooms = property.number_of_rooms - totalBooked;

//       if (availableRooms < roomsBooked) {
//         await transaction.update({ status: 'refunded' }, { transaction: t });
//         await t.commit();
//         return res.status(400).json({ 
//           message: `Only ${availableRooms} room(s) available - payment refunded`
//         });
//       }

//       // Create rental record
//       const rental = await RentalBooking.create({
//         user_id,
//         property_id,
//         rooms_booked: roomsBooked,
//         amount_paid: paymentData.amount / 100,
//         start_date: new Date(),
//         end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
//       }, { transaction: t });

//       // Atomic room decrement
//       await Property.decrement('number_of_rooms', {
//         by: roomsBooked,
//         where: { id: property.id },
//         transaction: t
//       });

//       // Get updated property data
//       const updatedProperty = await Property.findByPk(property.id, { 
//         attributes: ['id', 'number_of_rooms'],
//         transaction: t 
//       });

//       await t.commit();

//       return res.status(200).json({
//         message: "Rental payment verified successfully",
//         transaction,
//         property: {
//           id: updatedProperty.id,
//           number_of_rooms: updatedProperty.number_of_rooms,
//           available_rooms: updatedProperty.number_of_rooms - (totalBooked + roomsBooked)
//         },
//         rentalDetails: {
//           bookingId: rental.id,
//           roomsBooked,
//           startDate: rental.start_date,
//           endDate: rental.end_date
//         }
//       });
//     }

//     // Default case
//     await t.commit();
//     return res.status(200).json({
//       message: "Payment verified, but no specific ownership type was processed",
//       transaction
//     });

//   } catch (error) {
//     await t.rollback();
//     console.error("Payment Verification Error:", {
//       message: error.message,
//       reference: req.query.reference,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//     return res.status(500).json({ 
//       message: "Error verifying payment",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


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