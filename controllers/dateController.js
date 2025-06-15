const DateModel = require('../models/dateModel');

// Create a new date
const createDate = async (req, res) => {
  try {
    const { title, date, description, classification, isRecurring } = req.body;

    const newDate = await DateModel.create({
      title,
      date,
      description,
      classification,
      isRecurring
    });

    res.status(201).json(newDate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all dates
const getAllDates = async (req, res) => {
  try {
    const dates = await DateModel.find().sort({ date: -1 });
    res.status(200).json(dates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single date by ID
const getDateById = async (req, res) => {
  try {
    const { id } = req.params;
    const date = await DateModel.findById(id);

    if (!date) {
      return res.status(404).json({ error: 'Date not found' });
    }

    res.status(200).json(date);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a date
const updateDate = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await DateModel.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Date not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a date
const deleteDate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DateModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Date not found' });
    }

    res.status(200).json({ message: 'Date deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDate,
  getAllDates,
  getDateById,
  updateDate,
  deleteDate
};
