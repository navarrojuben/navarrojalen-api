const express = require('express');
const router = express.Router();
const {
  getMessages,
  createMessage,
  deleteMessage,
  getMessageCount,
  markMessageAsRead,       // Import the new function
  getUnreadMessageCount    // Import the new function
} = require('../controllers/messageController');

const Message = require('../models/messageModel'); // Keep this if you need it for direct model interaction in routes, though typically controllers handle it.

// Replace with auth middleware when ready
router.get('/', getMessages);
router.post('/', createMessage);
router.delete('/:id', deleteMessage);

// Route to mark a message as read
router.patch('/:id/read', markMessageAsRead); // Use PATCH for partial updates

// Route to get total message count (if still needed)
router.get('/count', getMessageCount);

// Route to get unread message count for the sidebar badge
router.get('/unread-count', getUnreadMessageCount);

module.exports = router;