const Note = require('../models/noteModel');

// Get all notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new note
const createNote = async (req, res) => {
  const { title, description, note } = req.body;

  const newNote = new Note({
    title,
    description,
    note
  });

  try {
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a note
const updateNote = async (req, res) => {
  const { title, description, note } = req.body;

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, description, note },
      { new: true }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote
};
