const { Property, FullOwnership, FractionalOwnership, InstallmentOwnership, sequelize, Transaction } = require('../models');
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

    // Validate input
    if (!Array.isArray(slotIds) || slotIds.length === 0 || !pricePerSlot || pricePerSlot <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid request data. Provide valid slot IDs and positive price."
      });
    }

    // Verify ownership first
    const ownedSlots = await FractionalOwnership.findAll({
      where: {
        id: { [Op.in]: slotIds },
        user_id: userId,
        property_id: propertyId,
        slots_purchased: { [Op.gt]: 0 }
      },
      transaction: t
    });

    if (ownedSlots.length !== slotIds.length) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "You don't own all the specified slots"
      });
    }

    // Verify payments separately to avoid transaction issues
    const slotsWithPayments = await Transaction.findAll({
      where: {
        slot_id: { [Op.in]: slotIds },
        status: 'success',
        payment_type: {
          [Op.in]: ['fractional', 'fractionalInstallment']
        }
      },
      attributes: ['slot_id'],
      group: ['slot_id'],
      transaction: t
    });

    const paidSlotIds = slotsWithPayments.map(t => t.slot_id);
    const unpaidSlots = slotIds.filter(id => !paidSlotIds.includes(id));

    if (unpaidSlots.length > 0) {
      await t.rollback();
      return res.status(402).json({
        success: false,
        message: "Some slots have incomplete payments",
        unpaidSlots
      });
    }

    // Check for already relisted slots
    const alreadyRelisted = ownedSlots.filter(slot => slot.is_relisted);
    if (alreadyRelisted.length > 0) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: "Some slots are already relisted",
        alreadyRelisted: alreadyRelisted.map(s => s.id)
      });
    }

    // Update slots
    const [updateCount] = await FractionalOwnership.update(
      {
        is_relisted: true,
        relist_price: pricePerSlot,
        updatedAt: new Date()
      },
      {
        where: { id: { [Op.in]: slotIds } },
        transaction: t
      }
    );

    if (updateCount !== slotIds.length) {
      await t.rollback();
      return res.status(500).json({
        success: false,
        message: "Failed to update all slots"
      });
    }

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Slots relisted successfully",
      data: {
        relistedSlots: slotIds,
        pricePerSlot,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Relist slots error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to relist slots",
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        stack: error.stack
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