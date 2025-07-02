const Resume = require('../models/resumeModel');

// GET /api/resume
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne();
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
  } catch (err) {
    console.error('Error fetching resume:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/resume
exports.updateResume = async (req, res) => {
  try {
    let resume = await Resume.findOne();
    if (!resume) {
      // If no resume exists, create a new one
      resume = new Resume(req.body);
    } else {
      // Update existing fields
      Object.assign(resume, req.body);
    }
    const saved = await resume.save();
    res.json(saved);
  } catch (err) {
    console.error('Error updating resume:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
