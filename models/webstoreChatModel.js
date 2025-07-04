const mongoose = require('mongoose');

const webstoreChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebstoreUser',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebstoreChat', webstoreChatSchema);
