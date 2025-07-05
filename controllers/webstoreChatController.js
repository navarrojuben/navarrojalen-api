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

// GET /api/webstore-chat/latest-message/:userId
const getLatestMessageTimestamp = async (req, res) => {
  try {
    const latest = await WebstoreChat.findOne({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .select('createdAt');

    res.status(200).json({ createdAt: latest?.createdAt || null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch latest message', error: err.message });
  }
};

// GET /api/webstore-chat/admin/latest-messages
const getLatestMessagesForAllUsers = async (req, res) => {
  try {
    const latestPerUser = await WebstoreChat.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$user',
          lastMessageTime: { $first: '$createdAt' },
        },
      },
      {
        $project: {
          userId: '$_id',
          lastMessageTime: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(latestPerUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch latest messages for all users', error: err.message });
  }
};

// DELETE /api/webstore-chat/by-user/:userId
const deleteMessagesByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await WebstoreChat.deleteMany({ user: userId });
    res.status(200).json({ deletedMessages: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete messages', error: err.message });
  }
};

// ✅ DELETE /api/webstore-chat/by-ids
const deleteMessagesByIds = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No message IDs provided' });
  }

  try {
    const result = await WebstoreChat.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ deletedMessages: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete messages by IDs', error: err.message });
  }
};

// GET /api/webstore-chat/user/:userId/count
const getMessageCountByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const count = await WebstoreChat.countDocuments({ user: userId });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get message count', error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessagesByUser,
  getAllMessages,
  markAsRead,
  getLatestMessageTimestamp,
  getLatestMessagesForAllUsers,
  deleteMessagesByUserId,
  deleteMessagesByIds, // ✅ export bulk delete
  getMessageCountByUserId,
};
