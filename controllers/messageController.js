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

    // When creating a new message, it's always unread by default
    const newMessage = new Message({ name, email, message, read: false });
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

// Mark a message as read
const markMessageAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { read: true },
      { new: true } // Return the updated document
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    res.status(200).json({ message: 'Message marked as read.', updatedMessage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark message as read.' });
  }
};


// Get count of unread messages
const getUnreadMessageCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ read: false });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread message count.' });
  }
};

// Existing getMessageCount (can be removed if only unread count is needed client-side)
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
  markMessageAsRead, // Added new function
  getUnreadMessageCount, // Added new function for sidebar badge
  getMessageCount,
};