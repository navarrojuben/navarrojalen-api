const express = require('express');
const router = express.Router();

const {
  sendMessage,
  getMessagesByUser,
  getAllMessages,
  markAsRead,
  getLatestMessageTimestamp,
  getLatestMessagesForAllUsers,
  deleteMessagesByUserId,
  deleteMessagesByIds, // ✅ NEW: bulk delete route
  getMessageCountByUserId,
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

// 🧹 Delete all messages for a user (admin use)
router.delete('/by-user/:userId', deleteMessagesByUserId);

// 🧹✅ Bulk delete messages by IDs (admin use)
router.delete('/by-ids', deleteMessagesByIds); // <--- added this line

// 🔢 Count messages by user ID
router.get('/user/:userId/count', getMessageCountByUserId);

module.exports = router;
