const mongoose = require("mongoose");

const presentationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  photos: {
    type: [String], // array of image URLs
    required: true,
    validate: [arr => arr.length > 0, "At least one photo is required"]
  },
  musicUrl: {
    type: String,
    default: "",
  },
  slideDuration: {
    type: Number,
    default: 3,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Presentation", presentationSchema);
