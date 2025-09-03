// controllers/MessageController.js
const { Op } = require('sequelize'); 
const { Message, User } = require('../models');

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.findAll();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const newMessage = await Message.create(req.body);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: 'Error creating message', error });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Message.update(req.body, { where: { id } });

    if (updated) {
      const updatedMessage = await Message.findOne({ where: { id } });
      res.status(200).json(updatedMessage);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating message', error });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Message.destroy({ where: { id } });

    if (deleted) {
      res.status(204).json({ message: 'Message deleted' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { recipient_id, message } = req.body; // ✅ Fix: Use `message`, not `content`
    const sender_id = req.user.id; // Extracted from JWT token

    if (!recipient_id || !message) {
      return res.status(400).json({ message: "Recipient ID and message are required." });
    }

    const newMessage = await Message.create({ sender_id, recipient_id, message });

    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};


exports.getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params; // Extract from URL
    const currentUserId = req.user.id; // Get from authenticated user

    console.log('Current User ID:', currentUserId);
    console.log('Recipient ID:', recipientId);

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: currentUserId, recipient_id: recipientId },
          { sender_id: recipientId, recipient_id: currentUserId },
        ],
      },
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({ message: 'Messages retrieved successfully', data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};


// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params; // Get message ID from request params
    const userId = req.user.id; // Extract user ID from JWT token

    // Find the message
    const message = await Message.findOne({ where: { id: messageId } });

    // Check if message exists
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Ensure only the recipient can mark the message as read
    if (message.recipient_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to mark this message as read' });
    }

    // Update the message status
    await message.update({ status: 'read' });

    res.status(200).json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
};

exports.getRecentChats = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all chat partners with their last message time
    const chatPartners = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: currentUserId },
          { recipient_id: currentUserId }
        ]
      },
      attributes: [
        [sequelize.literal(`CASE WHEN sender_id = ${currentUserId} THEN recipient_id ELSE sender_id END`), 'partner_id'],
        [sequelize.fn('MAX', sequelize.col('Message.createdAt')), 'last_message_at']
      ],
      group: ['partner_id'],
      order: [[sequelize.literal('last_message_at'), 'DESC']],
      raw: true
    });

    if (chatPartners.length === 0) {
      return res.status(200).json({
        message: 'No recent chats found',
        data: []
      });
    }

    const partnerIds = chatPartners.map(chat => chat.partner_id);

    // Get all partner details in one query
    const partners = await User.findAll({
      where: { id: partnerIds },
      attributes: ['id', 'name', 'profileImage', 'role'],
      raw: true
    });

    const partnerMap = partners.reduce((acc, partner) => {
      acc[partner.id] = partner;
      return acc;
    }, {});

    // Get unread counts for all partners in one query
    const unreadCounts = await Message.findAll({
      where: {
        sender_id: partnerIds,
        recipient_id: currentUserId,
        status: 'sent'
      },
      attributes: [
        'sender_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'unread_count']
      ],
      group: ['sender_id'],
      raw: true
    });

    const unreadMap = unreadCounts.reduce((acc, item) => {
      acc[item.sender_id] = parseInt(item.unread_count);
      return acc;
    }, {});

    // Get last messages for all conversations
    const lastMessages = await Message.findAll({
      where: {
        [Op.or]: partnerIds.map(partnerId => [
          { sender_id: currentUserId, recipient_id: partnerId },
          { sender_id: partnerId, recipient_id: currentUserId }
        ]).flat()
      },
      attributes: [
        'sender_id',
        'recipient_id',
        'message',
        'createdAt',
        [sequelize.literal(`CASE WHEN sender_id = ${currentUserId} THEN recipient_id ELSE sender_id END`), 'partner_id']
      ],
      order: [['createdAt', 'DESC']],
      raw: true
    });

    const lastMessageMap = {};
    lastMessages.forEach(msg => {
      const partnerId = msg.partner_id;
      if (!lastMessageMap[partnerId] || new Date(msg.createdAt) > new Date(lastMessageMap[partnerId].createdAt)) {
        lastMessageMap[partnerId] = {
          message: msg.message,
          createdAt: msg.createdAt
        };
      }
    });

    // Build the response
    const recentChats = chatPartners.map(chat => {
      const partner = partnerMap[chat.partner_id];
      if (!partner) return null;

      return {
        id: partner.id,
        name: partner.name,
        avatar: partner.profileImage,
        role: partner.role,
        unreadCount: unreadMap[partner.id] || 0,
        lastMessage: lastMessageMap[partner.id]?.message || '',
        lastMessageTime: lastMessageMap[partner.id]?.createdAt || null
      };
    }).filter(chat => chat !== null);

    res.status(200).json({
      message: 'Recent chats retrieved successfully',
      data: recentChats
    });
  } catch (error) {
    console.error('Error fetching recent chats:', error);
    res.status(500).json({ 
      message: 'Error fetching recent chats', 
      error: error.message 
    });
  }
};