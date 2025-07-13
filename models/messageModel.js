const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true, maxlength: 300 },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false } // New field to track read status
});

module.exports = mongoose.model('Message', messageSchema);