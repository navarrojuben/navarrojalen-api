// backend/controllers/imageController.js
const cloudinary = require('cloudinary').v2;
const Image = require('../models/imageModel');

// GET all images
exports.getImages = async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST upload image
exports.uploadImage = async (req, res) => {
  try {
    console.log('📦 Uploaded file:', req.file);
    console.log('📨 Body:', req.body);

    const image = new Image({
      name: req.body.name,
      description: req.body.description || '',
      tags: JSON.parse(req.body.tags || '[]'),
      url: req.file.path,
      public_id: req.file.filename,
    });

    const saved = await image.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('🔥 Upload error:', err);
    res.status(500).json({ message: err.message });
  }
};






// PATCH update image info
exports.updateImage = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (tagArray) updateData.tags = tagArray;

    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedImage) return res.status(404).json({ message: 'Image not found' });

    res.json(updatedImage);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE image by Mongo _id, then delete from Cloudinary
exports.deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const result = await cloudinary.uploader.destroy(image.public_id);

    if (result.result !== 'ok') {
      return res.status(400).json({ success: false, message: 'Failed to delete from Cloudinary' });
    }

    await Image.findByIdAndDelete(id);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


