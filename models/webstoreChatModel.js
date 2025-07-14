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
      // Message is optional if imageUrls array has elements
      required: function() { return !this.imageUrls || this.imageUrls.length === 0; },
      trim: true,
    },
    // MODIFIED: imageUrls is now an array of strings
    imageUrls: {
      type: [String], // Array of strings for multiple image URLs
      default: [],    // Default to an empty array
      // imageUrls is optional if message is present
      required: function() { return !this.message && (this.imageUrls && this.imageUrls.length > 0); },
      // This 'required' ensures that if there's no message, there MUST be at least one image.
      // But if there IS a message, imageUrls is not required.
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

// Add a pre-save validation to ensure at least one of message or imageUrls exists
webstoreChatSchema.pre('validate', function(next) {
  if (!this.message && (!this.imageUrls || this.imageUrls.length === 0)) {
    this.invalidate('message', 'A message must have either text content or at least one image URL.', null);
    this.invalidate('imageUrls', 'A message must have either text content or at least one image URL.', null);
  }
  next();
});

module.exports = mongoose.model('WebstoreChat', webstoreChatSchema);