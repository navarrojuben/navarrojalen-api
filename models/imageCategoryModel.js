// backend/models/imageCategoryModel.js
const mongoose = require('mongoose');

const imageCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },

    // Add images like a playlist
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImageCategory', imageCategorySchema);
