const express = require("express");
const router = express.Router();

const {
  createPresentation,
  getAllPresentations,
  getPresentationById,
  updatePresentation,
  deletePresentation,
} = require("../controllers/presentationController");

// Create
router.post("/", createPresentation);

// Read all
router.get("/", getAllPresentations);

// Read one
router.get("/:id", getPresentationById);

// Update
router.put("/:id", updatePresentation);

// Delete
router.delete("/:id", deletePresentation);

module.exports = router;
