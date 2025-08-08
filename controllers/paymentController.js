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
  // Enhanced transaction configuration with detailed options
  const t = await sequelize.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    timeout: 30000, // 30 second timeout
    deferrable: Sequelize.Deferrable.SET_DEFERRED,
    logging: console.log // Add transaction logging
  });

  try {
    const { reference } = req.query;
    if (!reference) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Transaction reference is required",
        error_code: "MISSING_REFERENCE"
      });
    }

    // 1. Verify with Paystack first (outside transaction to minimize locking)
    console.log(`Starting Paystack verification for reference: ${reference}`);
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000 // 15 seconds timeout
      }
    ).catch(err => {
      console.error("Paystack verification failed:", err.response?.data || err.message);
      throw new Error(`Paystack verification failed: ${err.message}`);
    });

    const paymentData = paystackResponse.data.data;
    if (paymentData.status !== "success") {
      console.log(`Payment not successful for reference: ${reference}`);
      return res.status(400).json({
        message: "Payment not successful",
        status: paymentData.status,
        gateway_response: paymentData.gateway_response,
        reference: reference
      });
    }

    // 2. Extract and validate metadata with detailed checks
    const { 
      user_id, 
      property_id, 
      payment_type, 
      client_id, 
      slots = 1, 
      rooms = 1 
    } = paymentData.metadata || {};
    
    console.log('Extracted payment metadata:', {
      user_id,
      property_id,
      payment_type,
      client_id,
      slots,
      rooms
    });

    if (!user_id || !payment_type) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Incomplete payment metadata",
        error_code: "INCOMPLETE_METADATA",
        required_fields: {
          user_id: !user_id ? "Missing" : "Provided",
          payment_type: !payment_type ? "Missing" : "Provided"
        },
        reference: reference
      });
    }

    // 3. Check for existing transaction with row locking and detailed logging
    console.log(`Checking for existing transaction with reference: ${reference}`);
    const existingTransaction = await Transaction.findOne({ 
      where: { reference },
      transaction: t,
      lock: t.LOCK.UPDATE,
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'email', 'name'],
          transaction: t
        },
        { 
          model: Property, 
          as: 'property', 
          attributes: ['id', 'title', 'is_sold'],
          transaction: t
        }
      ]
    });
    
    if (existingTransaction) {
      console.log(`Found existing transaction for reference: ${reference}`);
      await t.commit();
      return res.status(200).json({
        message: "Payment already verified",
        transaction: {
          id: existingTransaction.id,
          reference: existingTransaction.reference,
          status: existingTransaction.status,
          payment_type: existingTransaction.payment_type,
          amount: existingTransaction.price,
          date: existingTransaction.transaction_date,
          user: existingTransaction.user,
          property: existingTransaction.property
        }
      });
    }

    // 4. Get user and property with locking and proper error handling
    console.log(`Fetching user ${user_id} and property ${property_id} with locking`);
    const [user, property] = await Promise.all([
      User.findByPk(user_id, { 
        transaction: t,
        attributes: ['id', 'email', 'name', 'phone'],
        lock: t.LOCK.UPDATE
      }).catch(err => {
        console.error(`Error fetching user ${user_id}:`, err);
        throw new Error(`Failed to fetch user details`);
      }),
      
      property_id ? Property.findByPk(property_id, { 
        transaction: t,
        attributes: [
          'id', 'title', 'is_fractional', 'isInstallment', 'isRental', 
          'is_sold', 'fractional_slots', 'price_per_slot', 'price',
          'annual_rent', 'duration', 'isFractionalInstallment', 'isFractionalDuration'
        ],
        lock: t.LOCK.UPDATE
      }).catch(err => {
        console.error(`Error fetching property ${property_id}:`, err);
        throw new Error(`Failed to fetch property details`);
      }) : Promise.resolve(null)
    ]);

    if (!user) {
      await t.rollback();
      return res.status(404).json({ 
        message: "User not found",
        error_code: "USER_NOT_FOUND",
        user_id: user_id
      });
    }

    // 5. Create transaction record with detailed logging
    console.log(`Creating transaction record for reference: ${reference}`);
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
      transaction: t,
      logging: console.log
    }).catch(err => {
      console.error("Error creating transaction:", err);
      throw new Error("Failed to create transaction record");
    });

    // ========== PAYMENT TYPE PROCESSING ==========
    const getAvailableFractionalSlots = async (propertyId) => {
      console.log(`Checking available slots for property ${propertyId}`);
      const ownerships = await FractionalOwnership.findAll({ 
        where: { property_id: propertyId },
        transaction: t,
        lock: t.LOCK.UPDATE
      }).catch(err => {
        console.error("Error fetching fractional ownerships:", err);
        throw new Error("Failed to check fractional slots");
      });
      
      const available = property.fractional_slots - ownerships.reduce((sum, o) => sum + o.slots_purchased, 0);
      console.log(`Available slots: ${available}`);
      return available;
    };

    // FULL/OUTRIGHT PAYMENT - Comprehensive handling
    if (payment_type === "full" || payment_type === "outright") {
      console.log(`Processing full payment for property ${property_id}`);
      
      if (!property) {
        await t.rollback();
        return res.status(404).json({ 
          message: "Property not found for full payment",
          error_code: "PROPERTY_NOT_FOUND",
          property_id: property_id
        });
      }

      // Atomic check for existing ownership and property status
      console.log(`Checking existing ownership for property ${property_id}`);
      const [existingFullOwnership, propertyStatus] = await Promise.all([
        FullOwnership.findOne({
          where: { property_id: property.id },
          transaction: t,
          lock: t.LOCK.UPDATE
        }),
        Property.findOne({
          where: { id: property.id, is_sold: false },
          transaction: t,
          lock: t.LOCK.UPDATE
        })
      ]);

      if (existingFullOwnership || !propertyStatus) {
        await t.rollback();
        return res.status(409).json({ 
          message: "Property already sold or has existing full owner",
          error_code: "PROPERTY_ALREADY_SOLD",
          property_id: property.id,
          existing_owner: existingFullOwnership?.user_id,
          is_sold: property.is_sold
        });
      }

      // Process full payment
      try {
        console.log(`Creating full ownership for property ${property.id}`);
        await Promise.all([
          FullOwnership.create({
            user_id,
            property_id: property.id,
            purchase_date: new Date(),
            purchase_amount: paymentData.amount / 100
          }, { 
            transaction: t,
            logging: console.log
          }),
          
          Property.update(
            { is_sold: true },
            { 
              where: { id: property.id }, 
              transaction: t,
              logging: console.log
            }
          )
        ]);
        
        console.log(`Successfully processed full payment for property ${property.id}`);
      } catch (err) {
        console.error("Error processing full payment:", err);
        throw new Error("Failed to process full payment");
      }
    } 
    // FRACTIONAL PAYMENT
    else if (payment_type === "fractional" && property?.is_fractional) {
      console.log(`Processing fractional payment for property ${property.id}`);
      
      const availableSlots = await getAvailableFractionalSlots(property.id);
      if (slots > availableSlots) {
        await t.rollback();
        return res.status(400).json({ 
          message: 'Not enough fractional slots available',
          error_code: "INSUFFICIENT_SLOTS",
          availableSlots,
          requestedSlots: slots,
          property_id: property.id
        });
      }

      await FractionalOwnership.create({
        user_id,
        property_id: property.id,
        slots_purchased: slots
      }, { 
        transaction: t,
        logging: console.log
      });
    }
    // FRACTIONAL INSTALLMENT
    else if (payment_type === "fractionalInstallment" && property?.is_fractional && property.isFractionalInstallment) {
      console.log(`Processing fractional installment for property ${property.id}`);
      
      const today = new Date();
      let ownership = await InstallmentOwnership.findOne({
        where: { user_id, property_id: property.id },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!ownership) {
        const availableSlots = await getAvailableFractionalSlots(property.id);
        if (slots > availableSlots) {
          await t.rollback();
          return res.status(400).json({ 
            message: 'Not enough fractional slots available',
            error_code: "INSUFFICIENT_SLOTS",
            availableSlots,
            requestedSlots: slots
          });
        }

        ownership = await InstallmentOwnership.create({
          user_id,
          property_id: property.id,
          start_date: today,
          total_months: property.isFractionalDuration,
          months_paid: 1,
          status: property.isFractionalDuration === 1 ? "completed" : "ongoing"
        }, { transaction: t });

        await FractionalOwnership.create({
          user_id,
          property_id: property.id,
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
        property_id: property.id,
        amount_paid: paymentData.amount / 100,
        payment_month: today.getMonth() + 1,
        payment_year: today.getFullYear()
      }, { transaction: t });
    }
    // STANDARD INSTALLMENT
    else if (payment_type === "installment" && property?.isInstallment && !property.is_fractional) {
      console.log(`Processing standard installment for property ${property.id}`);
      
      const today = new Date();
      let ownership = await InstallmentOwnership.findOne({
        where: { user_id, property_id: property.id },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!ownership) {
        ownership = await InstallmentOwnership.create({
          user_id,
          property_id: property.id,
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
        property_id: property.id,
        amount_paid: paymentData.amount / 100,
        payment_month: today.getMonth() + 1,
        payment_year: today.getFullYear()
      }, { transaction: t });
    }
    // RENTAL PAYMENT
    else if (payment_type === "rental" && property?.isRental) {
      console.log(`Processing rental payment for property ${property.id}`);
      
      const roomsBooked = parseInt(rooms) || 1;
      
      await RentalBooking.create({
        user_id,
        property_id: property.id,
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

    // ========== NOTIFICATION INTEGRATION ==========
    console.log(`Creating notifications for payment ${reference}`);
    const io = req.app.get('socketio');
    const notificationPromises = [];

    // Client notification
    notificationPromises.push(
      Notification.create({
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
      }, { transaction: t })
    );

    // Admin notifications
    if (process.env.NOTIFY_ADMINS === 'true') {
      const admins = await User.findAll({ 
        where: { role: 'admin' },
        transaction: t,
        attributes: ['id'],
        lock: t.LOCK.UPDATE
      });

      admins.forEach(admin => {
        notificationPromises.push(
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
        );
      });
    }

    const notifications = await Promise.all(notificationPromises);
    const clientNotification = notifications[0];

    // Final commit with logging
    console.log(`Committing transaction for payment ${reference}`);
    await t.commit();
    console.log(`Transaction committed successfully for ${reference}`);

    // Real-time notifications
    if (io) {
      console.log(`Emitting socket notifications for payment ${reference}`);
      io.to(`user_${user_id}`).emit('new_notification', clientNotification);
      
      if (process.env.NOTIFY_ADMINS === 'true') {
        notifications.slice(1).forEach(notif => {
          io.to(`user_${notif.user_id}`).emit('new_notification', notif);
        });
      }
    }

    // Prepare detailed response
    const responseData = {
      message: "Payment verified successfully",
      transaction: {
        id: transaction.id,
        reference: transaction.reference,
        amount: transaction.price,
        status: transaction.status,
        payment_type: transaction.payment_type,
        date: transaction.transaction_date,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    };

    if (property) {
      responseData.property = {
        id: property.id,
        title: property.title,
        is_sold: payment_type === "full" ? true : property.is_sold
      };
    }

    console.log(`Successfully processed payment ${reference}`);
    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Payment Verification Error:", {
      timestamp: new Date().toISOString(),
      reference: req.query.reference,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      request: {
        query: req.query,
        body: req.body
      }
    });
    
    if (!t.finished) {
      try {
        console.log(`Attempting to rollback transaction for ${reference}`);
        await t.rollback();
        console.log(`Rollback successful for ${reference}`);
      } catch (rollbackError) {
        console.error("Rollback failed:", {
          error: rollbackError.message,
          stack: rollbackError.stack
        });
      }
    }
    
    const errorResponse = {
      message: "Payment verification failed",
      reference: reference,
      timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        name: error.name,
        message: error.message,
        ...(error.errors && { details: error.errors })
      };
    }

    return res.status(500).json(errorResponse);
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