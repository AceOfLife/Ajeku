const { Notification } = require('../models');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;

    const notification = await Notification.create({
      user_id,
      title,
      message,
      type
    });

    return res.status(201).json({ message: 'Notification created', notification });
  } catch (error) {
    console.error("Create Notification Error:", error);
    return res.status(500).json({ message: 'Failed to create notification', error });
  }
};

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ message: 'Notifications fetched', notifications });
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return res.status(500).json({ message: 'Failed to fetch notifications', error });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error("Mark as Read Error:", error);
    return res.status(500).json({ message: 'Failed to update notification', error });
  }
};
