const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  techStack: [String],
  githubUrl: String,
  liveUrl: String,
  imageUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
