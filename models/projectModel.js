const mongoose = require('mongoose');

// Define a sub-schema for individual images
const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true, // A URL is required for each image entry
  },
  description: { // Specific description for this individual image
    type: String,
    default: '', // Default to an empty string if no description is provided for an image
  },
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Assuming title is always required for a project
  },
  description: {
    type: String,
    required: true, // Assuming overall project description is required
  },
  techStack: {
    type: [String],
    default: [], // Default to an empty array if no tech stack is provided
  },
  githubUrl: String, // GitHub URL can be optional
  liveUrl: String,   // Live URL can be optional
  imageUrl: {
    type: [imageSchema], // CHANGED: Now an array of embedded image objects using the imageSchema
    required: true,      // A project must have at least one image (even if just a placeholder)
    default: [],         // Default to an empty array
  },
}, { timestamps: true }); // timestamps adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('Project', projectSchema);