const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessagesByUser,
  getAllMessages,
  markAsRead,
} = require('../controllers/webstoreChatController');

// User sends a message
router.post('/', sendMessage);

// User fetches their messages
router.get('/my/:userId', getMessagesByUser);

// Admin fetches all messages
router.get('/admin/all', getAllMessages);

// Mark message(s) as read
router.put('/read/:userId', markAsRead);

module.exports = router;
