const Message = require('../models/messageModel');

// Create new message
const createMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message || message.length > 300) {
    return res.status(400).json({ error: 'Invalid input. Ensure message is under 300 characters.' });
  }

  try {
    // Check if inbox is full
    const messageCount = await Message.countDocuments();
    if (messageCount >= 20) {
      return res.status(400).json({ error: 'Inbox is full. Please try again later.' });
    }

    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(200).json({ message: 'Message saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message.' });
  }
};

// Get all messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

// Delete message by ID
const deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Message.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
};

const getMessageCount = async (req, res) => {
  try {
    const count = await Message.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch message count.' });
  }
};

module.exports = {
  createMessage,
  getMessages,
  deleteMessage,
  getMessageCount,
};
