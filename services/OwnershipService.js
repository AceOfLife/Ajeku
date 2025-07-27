// const { Transaction, InstallmentOwnership, FractionalOwnership } = require('../models');
// const { Op } = require('sequelize');

// class OwnershipService {
//   /**
//    * Verify if user has full ownership of a property
//    */
//   static async verifyFullOwnership(userId, propertyId) {
//     // Check for full property purchase
//     const fullPayment = await Transaction.findOne({
//       where: {
//         user_id: userId,
//         property_id: propertyId,
//         status: 'success',
//         payment_type: { [Op.not]: ['fractional', 'fractionalInstallment'] }
//       }
//     });
//     if (fullPayment) return true;

//     // Check completed fractional ownership
//     const fractionalSlots = await FractionalOwnership.findAll({
//       where: { user_id: userId, property_id: propertyId }
//     });

//     // Check completed installment plans
//     const installment = await InstallmentOwnership.findOne({
//       where: { 
//         user_id: userId, 
//         property_id: propertyId,
//         status: 'completed' 
//       }
//     });

//     return fractionalSlots.length > 0 || !!installment;
//   }

//   /**
//    * Verify fractional slot ownership
//    */
//   static async verifySlotOwnership(userId, propertyId, slotIds = []) {
//     const where = { 
//       user_id: userId,
//       property_id: propertyId 
//     };

//     if (slotIds.length > 0) {
//       where.id = { [Op.in]: slotIds };
//     }

//     const slots = await FractionalOwnership.findAll({ where });
//     return slotIds.length > 0 ? slots.length === slotIds.length : slots.length > 0;
//   }
// }

// module.exports = OwnershipService;

const { Property, Transaction, InstallmentOwnership, FractionalOwnership } = require('../models');
const { Op } = require('sequelize');

class OwnershipService {
  /**
   * Verify if user has full ownership of a property
   */
  static async verifyFullOwnership(userId, propertyId) {
    try {
      // 1. First get the property to check its type
      const property = await Property.findByPk(propertyId);
      if (!property) return false;

      // 2. For non-fractional properties
      if (!property.is_fractional) {
        // Check full payment transaction
        const fullPayment = await Transaction.findOne({
          where: {
            user_id: userId,
            property_id: propertyId,
            status: 'success',
            payment_type: { [Op.notIn]: ['fractional', 'fractionalInstallment', 'installment'] }
          }
        });
        if (fullPayment) return true;

        // Check completed installment plan
        const installment = await InstallmentOwnership.findOne({
          where: { 
            user_id: userId,
            property_id: propertyId,
            status: 'completed'
          }
        });
        return !!installment;
      }

      // 3. For fractional properties
      const totalSlots = property.fractional_slots;
      const ownedSlots = await FractionalOwnership.sum('slots_purchased', {
        where: { 
          user_id: userId,
          property_id: propertyId,
          is_relisted: false // Don't count relisted slots
        }
      });

      return ownedSlots === totalSlots;

    } catch (error) {
      console.error('Ownership verification error:', error);
      return false;
    }
  }

  /**
   * Verify fractional slot ownership
   */
  static async verifySlotOwnership(userId, propertyId, slotIds = []) {
    const where = { 
      user_id: userId,
      property_id: propertyId,
      is_relisted: false // Only count active ownership
    };

    if (slotIds.length > 0) {
      where.id = { [Op.in]: slotIds };
    }

    const slots = await FractionalOwnership.findAll({ where });
    return slotIds.length > 0 ? slots.length === slotIds.length : slots.length > 0;
  }
}

module.exports = OwnershipService;