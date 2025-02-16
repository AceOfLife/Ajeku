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


// Send a message
// exports.sendMessage = async (req, res) => {
//   try {
//     const { recipient_id, content } = req.body;
//     const sender_id = req.user.id; // Extracted from JWT token

//     const message = await Message.create({ sender_id, recipient_id, content });

//     res.status(201).json({ message: 'Message sent successfully', data: message });
//   } catch (error) {
//     res.status(500).json({ message: 'Error sending message', error: error.message });
//   }
// };

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

// Get all messages between two users
// exports.getMessages = async (req, res) => {
//   try {
//     const { userId } = req.params; // Other user ID
//     const currentUserId = req.user.id;

//     console.log('Recipient ID:', recipientId); // Debugging
//     console.log('Sender ID:', senderId); // Debugging

//     const messages = await Message.findAll({
//       where: {
//         [Op.or]: [
//           { sender_id: currentUserId, recipient_id: userId },
//           { sender_id: userId, recipient_id: currentUserId },
//         ],
//       },
//       order: [['createdAt', 'ASC']],
//     });

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching messages', error: error.message });
//   }
// };


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
