const { Notification, User } = require('../models');

// Improved create notification with more options
exports.createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type, related_entity_id, metadata, action_url } = req.body;

    // Validate required fields
    if (!user_id || !title || !message || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const notification = await Notification.create({
      user_id,
      title,
      message,
      type,
      related_entity_id,
      metadata,
      action_url,
      is_read: false
    });

    return res.status(201).json({ 
      success: true,
      notification 
    });
  } catch (error) {
    console.error("Create Notification Error:", error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to create notification',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get paginated notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    return res.status(200).json({ 
      success: true,
      notifications,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, user_id: userId }
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    await notification.update({ is_read: true });

    return res.status(200).json({ 
      success: true,
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error("Mark as Read Error:", error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update notification'
    });
  }
};

// New: Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );

    return res.status(200).json({ 
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error("Mark All as Read Error:", error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update notifications'
    });
  }
};

// New: Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, user_id: userId }
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    await notification.destroy();

    return res.status(200).json({ 
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to delete notification'
    });
  }
};