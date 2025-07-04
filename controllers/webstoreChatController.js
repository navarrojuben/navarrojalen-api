const WebstoreChat = require('../models/webstoreChatModel');

// POST /api/webstore-chat
const sendMessage = async (req, res) => {
  const { userId, message, sender } = req.body;

  if (!userId || !message || !sender) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newMessage = await WebstoreChat.create({
      user: userId,
      message,
      sender,
    });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// GET /api/webstore-chat/my/:userId
const getMessagesByUser = async (req, res) => {
  try {
    const messages = await WebstoreChat.find({ user: req.params.userId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

// GET /api/webstore-chat/admin/all
const getAllMessages = async (req, res) => {
  try {
    const messages = await WebstoreChat.find().populate('user').sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

// PUT /api/webstore-chat/read/:userId
const markAsRead = async (req, res) => {
  try {
    await WebstoreChat.updateMany({ user: req.params.userId, read: false }, { read: true });
    res.status(200).json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read', error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessagesByUser,
  getAllMessages,
  markAsRead,
};
