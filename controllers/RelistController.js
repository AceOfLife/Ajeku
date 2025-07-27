const { Property, FractionalOwnership, sequelize } = require('../models');
const { Op } = require('sequelize'); 
const OwnershipService = require('../services/OwnershipService');


exports.relistProperty = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { propertyId, price } = req.body;
    const userId = req.user.id;

    console.log('Attempting property relist:', { userId, propertyId }); // Debug log

    // 1. Verify ownership using raw SQL
    const ownershipCheck = await sequelize.query(
      `SELECT 1 FROM "FractionalOwnerships"
       WHERE property_id = :propertyId
       AND user_id = :userId
       GROUP BY property_id
       HAVING COUNT(id) = (
         SELECT fractional_slots FROM "Properties" WHERE id = :propertyId
       )`,
      {
        replacements: { 
          propertyId: propertyId,
          userId: userId
        },
        type: sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (ownershipCheck.length === 0) {
      await t.rollback();
      return res.status(403).json({ 
        success: false,
        message: "You must complete all payments before relisting",
        details: `User ${userId} doesn't fully own property ${propertyId}`
      });
    }

    // 2. Update property using raw SQL
    await sequelize.query(
      `UPDATE "Properties"
       SET is_relisted = true,
           original_owner_id = :userId,
           price = :price,
           agent_id = NULL,
           updated_at = NOW()
       WHERE id = :propertyId`,
      {
        replacements: {
          userId: userId,
          price: price,
          propertyId: propertyId
        },
        transaction: t,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    await t.commit();
    
    res.status(200).json({ 
      success: true,
      message: "Property relisted successfully",
      propertyId: propertyId,
      newPrice: price
    });

  } catch (error) {
    await t.rollback();
    console.error('Property relist error:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      success: false,
      message: "Failed to relist property",
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        sql: error.sql // Shows the failing SQL query
      } : undefined
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

    // Verify ownership (with explicit table name)
    const canRelist = await FractionalOwnership.findAll({
      where: { 
        id: { [Op.in]: slotIds },
        user_id: userId,
        property_id: propertyId
      },
      transaction: t,
      // 👇 Critical override
      tableName: 'FractionalOwnerships' 
    });
    
    if (canRelist.length !== slotIds.length) {
      await t.rollback();
      return res.status(403).json({ 
        success: false,
        message: "You don't own these slots or payments are incomplete" 
      });
    }

    // Update slots (with explicit table name)
    await sequelize.query(
      `UPDATE "FractionalOwnerships" 
       SET is_relisted = true, relist_price = :price 
       WHERE id IN (:slotIds) AND user_id = :userId`,
      {
        replacements: { 
          price: pricePerSlot,
          slotIds: slotIds,
          userId: userId
        },
        transaction: t,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    await t.commit();
    res.status(200).json({ success: true, message: "Slots relisted successfully" });

  } catch (error) {
    await t.rollback();
    console.error('Relist error (raw query):', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to relist slots",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.checkRelistEligibility = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const canRelist = await OwnershipService.verifyFullOwnership(userId, propertyId);
    
    res.status(200).json({
      success: true,
      canRelist,
      message: canRelist 
        ? "User can relist this property" 
        : "User cannot relist - incomplete payments"
    });

  } catch (error) {
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