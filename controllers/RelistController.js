const { Property, FractionalOwnership, sequelize } = require('../models');
const OwnershipService = require('../services/OwnershipService');

exports.relistProperty = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { propertyId, price } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const canRelist = await OwnershipService.verifyFullOwnership(userId, propertyId);
    if (!canRelist) {
      await t.rollback();
      return res.status(403).json({ 
        success: false,
        message: "You must complete all payments before relisting" 
      });
    }

    // Update property
    await Property.update({
      is_relisted: true,
      original_owner_id: userId,
      price: price,
      agent_id: null // Remove from admin management
    }, { 
      where: { id: propertyId },
      transaction: t 
    });

    await t.commit();
    
    res.status(200).json({ 
      success: true,
      message: "Property relisted successfully" 
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ 
      success: false,
      message: "Failed to relist property",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.relistSlots = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { propertyId, slotIds, pricePerSlot } = req.body;
    const userId = req.user.id;

    // Verify slot ownership
    const canRelist = await OwnershipService.verifySlotOwnership(
      userId, 
      propertyId, 
      slotIds
    );
    
    if (!canRelist) {
      await t.rollback();
      return res.status(403).json({ 
        success: false,
        message: "You don't own these slots or payments are incomplete" 
      });
    }

    // Update slots
    await FractionalOwnership.update({
      is_relisted: true,
      relist_price: pricePerSlot
    }, { 
      where: { 
        id: { [Op.in]: slotIds },
        user_id: userId
      },
      transaction: t 
    });

    await t.commit();
    
    res.status(200).json({ 
      success: true,
      message: "Slots relisted successfully" 
    });

  } catch (error) {
    await t.rollback();
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


const getRelistedSlots = async (req, res) => {
  const { propertyId } = req.params;
  const relistedSlots = await FractionalOwnership.findAll({
    where: { 
      property_id: propertyId,
      is_relisted: true 
    }
  });
  res.json(relistedSlots);
};