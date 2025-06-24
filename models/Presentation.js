const mongoose = require("mongoose");

const presentationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  photos: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, "At least one photo is required"],
  },
  musicUrls: {
    type: [String], // ✅ changed from musicUrl: String
    default: [],
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.every(url => typeof url === "string"),
      message: "All music URLs must be strings",
    },
  },
  slideDuration: {
    type: Number,
    default: 3,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Presentation", presentationSchema);
