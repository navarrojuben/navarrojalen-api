// backend/models/imageModel.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  tags: {
    type: [String], // array of strings
    default: [],
  },
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
