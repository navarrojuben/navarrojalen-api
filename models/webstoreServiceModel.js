const mongoose = require('mongoose');

const webstoreServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Optional: photo, price, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebstoreService', webstoreServiceSchema);
