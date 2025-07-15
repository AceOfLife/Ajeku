const { Notification, User } = require('../models');

class NotificationHelper {
  static async createNotification({
    userId,
    title,
    message,
    type,
    relatedEntityId = null,
    metadata = null
  }) {
    try {
      return await Notification.create({
        userId,
        title,
        message,
        type,
        relatedEntityId,
        metadata,
        isRead: false
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Example: Send notification to all admins
  static async notifyAdmins({ title, message, type, relatedEntityId, metadata }) {
    try {
      const admins = await User.findAll({ where: { role: 'admin' } });
      const notifications = admins.map(admin => ({
        userId: admin.id,
        title,
        message,
        type,
        relatedEntityId,
        metadata
      }));
      
      return await Notification.bulkCreate(notifications);
    } catch (error) {
      console.error('Error notifying admins:', error);
      return null;
    }
  }
}

module.exports = NotificationHelper;