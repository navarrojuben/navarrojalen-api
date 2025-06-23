const express = require("express");
const router = express.Router();

const {
  createPresentation,
  getAllPresentations,
  getPresentationById,
  getPresentationByTitle, // ✅ New controller
  updatePresentation,
  deletePresentation,
} = require("../controllers/presentationController");

// Create
router.post("/", createPresentation);

// Read all
router.get("/", getAllPresentations);

// ✅ Read by title (must come before `/:id` to avoid route conflict)
router.get("/title/:title", getPresentationByTitle);

// Read one by ID
router.get("/:id", getPresentationById);

// Update
router.put("/:id", updatePresentation);

// Delete
router.delete("/:id", deletePresentation);

module.exports = router;
