const { Property, FullOwnership, FractionalOwnership, InstallmentOwnership, sequelize, User, Notification } = require('../models');
const { Op } = require('sequelize'); 
const OwnershipService = require('../services/OwnershipService');


exports.relistProperty = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { propertyId } = req.params; // Get from URL params
    const { price: relistPrice, reason } = req.body;
    const userId = req.user.id;

    // 1. Verify full ownership using positional parameters
    const [ownershipResult] = await sequelize.query(
      `SELECT 1 FROM "FractionalOwnerships"
       WHERE property_id = $1 AND user_id = $2
       GROUP BY property_id
       HAVING COUNT(*) = (
         SELECT fractional_slots FROM "Properties" WHERE id = $1
       )`,
      {
        bind: [propertyId, userId],
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (!ownershipResult) {
      await t.rollback();
      return res.status(403).json({ 
        success: false,
        message: "You must complete all payments before relisting",
        details: `User ${userId} doesn't fully own property ${propertyId}`
      });
    }

    // 2. Update property using positional parameters
    await sequelize.query(
      `UPDATE "Properties"
       SET is_relisted = true,
           original_owner_id = $1,
           price = $2,
           relist_reason = $3,
           agent_id = NULL,
           updated_at = NOW()
       WHERE id = $4`,
      {
        bind: [userId, relistPrice, reason, propertyId],
        transaction: t,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    await t.commit();
    
    res.status(200).json({ 
      success: true,
      message: "Property relisted successfully",
      propertyId,
      newPrice: relistPrice
    });

  } catch (error) {
    await t.rollback();
    console.error('Property relist error:', {
      message: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body
    });
    res.status(500).json({ 
      success: false,
      message: "Failed to relist property",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// exports.relistProperty = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { propertyId, price } = req.body;
//     const userId = req.user.id;

//     // Verify ownership
//     const canRelist = await OwnershipService.verifyFullOwnership(userId, propertyId);
//     if (!canRelist) {
//       await t.rollback();
//       return res.status(403).json({ 
//         success: false,
//         message: "You must complete all payments before relisting" 
//       });
//     }

//     // Update property
//     await Property.update({
//       is_relisted: true,
//       original_owner_id: userId,
//       price: price,
//       agent_id: null // Remove from admin management
//     }, { 
//       where: { id: propertyId },
//       transaction: t 
//     });

//     await t.commit();
    
//     res.status(200).json({ 
//       success: true,
//       message: "Property relisted successfully" 
//     });

//   } catch (error) {
//     await t.rollback();
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to relist property",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.relistSlots = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { propertyId, slotIds, pricePerSlot } = req.body;
//     const userId = req.user.id;

//     // Verify slot ownership
//     const canRelist = await OwnershipService.verifySlotOwnership(
//       userId, 
//       propertyId, 
//       slotIds
//     );
    
//     if (!canRelist) {
//       await t.rollback();
//       return res.status(403).json({ 
//         success: false,
//         message: "You don't own these slots or payments are incomplete" 
//       });
//     }

//     // Update slots
//     await FractionalOwnership.update({
//       is_relisted: true,
//       relist_price: pricePerSlot
//     }, { 
//       where: { 
//         id: { [Op.in]: slotIds },
//         user_id: userId
//       },
//       transaction: t 
//     });

//     await t.commit();
    
//     res.status(200).json({ 
//       success: true,
//       message: "Slots relisted successfully" 
//     });

//   } catch (error) {
//     await t.rollback();
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to relist slots",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

exports.relistSlots = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { propertyId, slotIds, pricePerSlot } = req.body;
    const userId = req.user.id;

    // Validate input (EXISTING CODE)
    if (!Array.isArray(slotIds) || slotIds.length === 0 || !pricePerSlot || pricePerSlot <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid request data. Provide valid slot IDs and positive price."
      });
    }

    // Verify ownership (EXISTING CODE)
    const validSlots = await FractionalOwnership.findAll({
      where: {
        id: { [Op.in]: slotIds },
        user_id: userId,
        property_id: propertyId,
        slots_purchased: { [Op.gt]: 0 }
      },
      transaction: t
    });

    // Check if all requested slots are valid (EXISTING CODE)
    if (validSlots.length !== slotIds.length) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "You don't own all the specified slots or they're invalid"
      });
    }

    // Check if any slots are already relisted (EXISTING CODE)
    const alreadyRelisted = validSlots.some(slot => slot.is_relisted);
    if (alreadyRelisted) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: "One or more slots are already relisted"
      });
    }

    // Update slots (EXISTING CODE)
    await FractionalOwnership.update(
      {
        is_relisted: true,
        relist_price: pricePerSlot,
        updated_at: new Date()
      },
      {
        where: { id: { [Op.in]: slotIds } },
        transaction: t
      }
    );

    // NEW: Verify update was successful
    const updatedSlots = await FractionalOwnership.findAll({
      where: { id: { [Op.in]: slotIds } },
      transaction: t
    });

    if (updatedSlots.some(slot => !slot.is_relisted)) {
      throw new Error('Slot update verification failed');
    }

    // NEW: Get property and user for notifications
    const [property, user] = await Promise.all([
      Property.findByPk(propertyId, { transaction: t }),
      User.findByPk(userId, { transaction: t })
    ]);

    // NEW: Notification transaction
    const notificationTransaction = await sequelize.transaction();
    let notificationsSent = false;
    try {
      const io = req.app.get('socketio');

      // Client notification (SAME PATTERN AS verifyPayment)
      const clientNotification = await Notification.create({
        user_id: userId,
        title: 'Slots Relisted Successfully',
        message: `You've successfully relisted ${slotIds.length} slot(s) in ${property.name}`,
        type: 'relist_confirmation',
        related_entity_id: propertyId,
        metadata: {
          slot_ids: slotIds,
          price_per_slot: pricePerSlot,
          property_id: propertyId
        }
      }, { transaction: notificationTransaction });

      // Admin notifications (SAME PATTERN AS verifyPayment)
      const admins = await User.findAll({ 
        where: { role: 'admin' },
        transaction: notificationTransaction
      });

      const adminNotifications = await Promise.all(
        admins.map(admin => 
          Notification.create({
            user_id: admin.id,
            title: 'New Slots Relisted',
            message: `User ${user.email} relisted ${slotIds.length} slot(s) in ${property.name}`,
            type: 'admin_alert',
            related_entity_id: propertyId,
            metadata: {
              user_id: userId,
              slot_ids: slotIds,
              price_per_slot: pricePerSlot,
              property_id: propertyId
            }
          }, { transaction: notificationTransaction })
        )
      );

      await notificationTransaction.commit();
      notificationsSent = true;

      // Real-time notifications (EXISTING PATTERN)
      if (io) {
        io.to(`user_${userId}`).emit('new_notification', {
          event: 'slots_relisted',
          data: clientNotification
        });

        adminNotifications.forEach(notif => {
          io.to(`user_${notif.user_id}`).emit('new_notification', {
            event: 'admin_slots_alert',
            data: notif
          });
        });
      }
    } catch (notificationError) {
      await notificationTransaction.rollback();
      console.error('Notification creation failed:', notificationError);
    }

    await t.commit();

    // Response (EXISTING CODE with added notification status)
    return res.status(200).json({
      success: true,
      message: notificationsSent 
        ? "Slots relisted successfully" 
        : "Slots relisted but notifications failed",
      data: {
        relistedSlots: slotIds,
        pricePerSlot,
        notificationsEnabled: notificationsSent
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Relist slots error:', {
      message: error.message,
      stack: error.stack,
      request: {
        user: req.user.id,
        body: req.body
      }
    });
    return res.status(500).json({
      success: false,
      message: "Failed to relist slots",
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code
      } : undefined
    });
  }
};

exports.checkRelistEligibility = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    // Check all ownership types
    const [fullOwnership, fractionalOwnership, installmentOwnership] = await Promise.all([
      // Check full ownership
      FullOwnership.findOne({
        where: {
          user_id: userId,
          property_id: propertyId
        }
      }),
      
      // Check fractional ownership
      FractionalOwnership.findOne({
        where: {
          user_id: userId,
          property_id: propertyId,
          slots_purchased: { [Op.gt]: 0 } // At least one slot
        }
      }),
      
      // Check installment ownership
      InstallmentOwnership.findOne({
        where: {
          user_id: userId,
          property_id: propertyId,
          status: 'completed' // Only completed installments
        }
      })
    ]);

    // Determine eligibility
    const canRelist = fullOwnership !== null || 
                     fractionalOwnership !== null || 
                     installmentOwnership !== null;

    res.status(200).json({
      success: true,
      canRelist,
      message: canRelist 
        ? "User can relist this property" 
        : "User cannot relist - no valid ownership or incomplete payments"
    });

  } catch (error) {
    console.error('Relist eligibility check error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to check relist eligibility",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.getRelistedSlots = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Verify property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Get all relisted slots with owner info
    const relistedSlots = await FractionalOwnership.findAll({
      where: { 
        property_id: propertyId,
        is_relisted: true 
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone'],
          as: 'owner'
        }
      ],
      order: [['relist_price', 'ASC']] // Cheapest first
    });

    // Calculate stats
    const totalSlots = property.fractional_slots;
    const availableSlots = totalSlots - await FractionalOwnership.sum('slots_purchased', {
      where: { property_id: propertyId }
    });

    res.status(200).json({
      success: true,
      property: {
        id: property.id,
        name: property.name,
        total_slots: totalSlots,
        available_slots: availableSlots
      },
      slots: relistedSlots,
      count: relistedSlots.length
    });
  } catch (error) {
    console.error('Error fetching relisted slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch relisted slots',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};