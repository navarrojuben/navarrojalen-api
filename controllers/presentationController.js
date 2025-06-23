const Presentation = require("../models/Presentation");

// Create a new presentation
exports.createPresentation = async (req, res) => {
  try {
    const presentation = new Presentation(req.body);
    const saved = await presentation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all presentations
exports.getAllPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.find().sort({ createdAt: -1 });
    res.status(200).json(presentations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single presentation by ID
exports.getPresentationById = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ error: "Presentation not found" });
    }
    res.status(200).json(presentation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a presentation by ID
exports.updatePresentation = async (req, res) => {
  try {
    const updated = await Presentation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Presentation not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a presentation by ID
exports.deletePresentation = async (req, res) => {
  try {
    const deleted = await Presentation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Presentation not found" });
    }
    res.status(200).json({ message: "Presentation deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
