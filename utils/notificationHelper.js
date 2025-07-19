// const { Notification, User } = require('../models');

// class NotificationHelper {
//   static async createNotification({
//     userId,
//     title,
//     message,
//     type,
//     relatedEntityId = null,
//     metadata = null
//   }) {
//     try {
//       return await Notification.create({
//         userId,
//         title,
//         message,
//         type,
//         relatedEntityId,
//         metadata,
//         isRead: false
//       });
//     } catch (error) {
//       console.error('Error creating notification:', error);
//       return null;
//     }
//   }

//   // Example: Send notification to all admins
//   static async notifyAdmins({ title, message, type, relatedEntityId, metadata }) {
//     try {
//       const admins = await User.findAll({ where: { role: 'admin' } });
//       const notifications = admins.map(admin => ({
//         userId: admin.id,
//         title,
//         message,
//         type,
//         relatedEntityId,
//         metadata
//       }));
      
//       return await Notification.bulkCreate(notifications);
//     } catch (error) {
//       console.error('Error notifying admins:', error);
//       return null;
//     }
//   }
// }

// module.exports = NotificationHelper;

// 19/07/2025

const { Notification, User } = require('../models');

class NotificationHelper {
  static async createNotification({
    userId,
    title,
    message,
    type,
    relatedEntityId = null,
    metadata = null,
    actionUrl = null
  }) {
    try {
      return await Notification.create({
        user_id: userId,  // Changed to match your model's underscored fields
        title,
        message,
        type,
        related_entity_id: relatedEntityId,  // Changed to underscored
        metadata,
        action_url: actionUrl,  // Added to match your model
        is_read: false  // Changed to underscored
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  static async notifyAdmins({ title, message, type, relatedEntityId, metadata }) {
    try {
      const admins = await User.findAll({ where: { role: 'admin' } });
      const notifications = admins.map(admin => ({
        user_id: admin.id,  // Changed to underscored
        title,
        message,
        type,
        related_entity_id: relatedEntityId,  // Changed to underscored
        metadata,
        is_read: false  // Added to match your model
      }));
      
      return await Notification.bulkCreate(notifications);
    } catch (error) {
      console.error('Error notifying admins:', error);
      return null;
    }
  }
}

module.exports = NotificationHelper;