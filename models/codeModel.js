const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Code', codeSchema);
