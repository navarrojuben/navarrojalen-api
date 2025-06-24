const Presentation = require("../models/Presentation");

// Utility function to normalize music URLs
const normalizeMusicUrls = (musicUrl, musicUrls) => {
  const urls = [];

  if (Array.isArray(musicUrls)) {
    urls.push(...musicUrls.map((url) => url.trim()).filter(Boolean));
  }

  if (typeof musicUrl === 'string' && musicUrl.trim()) {
    urls.push(musicUrl.trim());
  }

  // Remove duplicates
  return [...new Set(urls)];
};


// Create a new presentation
exports.createPresentation = async (req, res) => {
  try {
    const { title, photos, musicUrl, musicUrls, slideDuration } = req.body;
    const payload = {
      title,
      photos,
      musicUrls: normalizeMusicUrls(musicUrl, musicUrls),
      slideDuration,
    };
    const presentation = new Presentation(payload);
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

// Get a single presentation by Title (slug-safe)
exports.getPresentationByTitle = async (req, res) => {
  try {
    const rawSlug = decodeURIComponent(req.params.title); // e.g. "test-1"

    const presentation = await Presentation.findOne({
      title: { $regex: new RegExp(`^${rawSlug}$`, 'i') } // case-insensitive exact match
    });

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
    const { title, photos, musicUrl, musicUrls, slideDuration } = req.body;
    const payload = {
      ...(title && { title }),
      ...(photos && { photos }),
      musicUrls: normalizeMusicUrls(musicUrl, musicUrls),
      ...(slideDuration && { slideDuration }),
    };

    const updated = await Presentation.findByIdAndUpdate(
      req.params.id,
      payload,
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
