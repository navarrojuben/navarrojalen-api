const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessagesByUser,
  getAllMessages,
  markAsRead,
  getLatestMessageTimestamp,
  getLatestMessagesForAllUsers,
} = require('../controllers/webstoreChatController');

// 📩 Send a message
router.post('/', sendMessage);

// 📬 Get messages by user
router.get('/my/:userId', getMessagesByUser);

// 📁 Admin: get all messages (with users populated)
router.get('/admin/all', getAllMessages);

// ✅ Mark all unread messages as read for a user
router.put('/read/:userId', markAsRead);

// 🕒 Get latest message timestamp for a specific user
router.get('/latest-message/:userId', getLatestMessageTimestamp);

// 🗂️ Get latest message timestamps for all users
router.get('/admin/latest-messages', getLatestMessagesForAllUsers);

module.exports = router;
