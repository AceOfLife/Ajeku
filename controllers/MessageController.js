// controllers/MessageController.js
const { Message } = require('../models');

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
