const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  tags: { type: [String], default: [] },

  imageCategories: [{ // reuse ImageCategory model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ImageCategory',
  }],

  url: { type: String, required: true },
  public_id: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
