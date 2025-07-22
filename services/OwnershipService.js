const { Transaction, InstallmentOwnership, FractionalOwnership } = require('../models');
const { Op } = require('sequelize');

class OwnershipService {
  /**
   * Verify if user has full ownership of a property
   */
  static async verifyFullOwnership(userId, propertyId) {
    // Check for full property purchase
    const fullPayment = await Transaction.findOne({
      where: {
        user_id: userId,
        property_id: propertyId,
        status: 'success',
        payment_type: { [Op.not]: ['fractional', 'fractionalInstallment'] }
      }
    });
    if (fullPayment) return true;

    // Check completed fractional ownership
    const fractionalSlots = await FractionalOwnership.findAll({
      where: { user_id: userId, property_id: propertyId }
    });

    // Check completed installment plans
    const installment = await InstallmentOwnership.findOne({
      where: { 
        user_id: userId, 
        property_id: propertyId,
        status: 'completed' 
      }
    });

    return fractionalSlots.length > 0 || !!installment;
  }

  /**
   * Verify fractional slot ownership
   */
  static async verifySlotOwnership(userId, propertyId, slotIds = []) {
    const where = { 
      user_id: userId,
      property_id: propertyId 
    };

    if (slotIds.length > 0) {
      where.id = { [Op.in]: slotIds };
    }

    const slots = await FractionalOwnership.findAll({ where });
    return slotIds.length > 0 ? slots.length === slotIds.length : slots.length > 0;
  }
}

module.exports = OwnershipService;