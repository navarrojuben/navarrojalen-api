const express = require('express');
const router = express.Router();
const {
  getMessages,
  createMessage,
  deleteMessage,
  getMessageCount
} = require('../controllers/messageController');

const Message = require('../models/messageModel');

// Replace with auth middleware when ready
router.get('/', getMessages);
router.get('/count', getMessageCount);
router.post('/', createMessage);
router.delete('/:id', deleteMessage);

// OPTIONAL: Message count route
router.get('/count', async (req, res) => {
  try {
    const count = await Message.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch message count.' });
  }
});

module.exports = router;
