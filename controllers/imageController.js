const cloudinary = require('cloudinary').v2;
const Image = require('../models/imageModel');
const ImageCategory = require('../models/imageCategoryModel');

// GET all images
exports.getImages = async (req, res) => {
  try {
    const images = await Image.find()
      .sort({ createdAt: -1 })
      .populate('imageCategories');
    res.json(images);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST upload image
exports.uploadImage = async (req, res) => {
  try {
    const { name, description } = req.body;

    const rawTags = req.body.tags;
    const rawCategories = req.body.imageCategories;

    const tags = Array.isArray(rawTags)
      ? rawTags
      : typeof rawTags === 'string'
      ? JSON.parse(rawTags)
      : [];

    const imageCategories = Array.isArray(rawCategories)
      ? rawCategories
      : typeof rawCategories === 'string'
      ? JSON.parse(rawCategories)
      : [];

    const image = new Image({
      name,
      description: description || '',
      tags,
      imageCategories,
      url: req.file.path,
      public_id: req.file.filename,
    });

    const saved = await image.save();

    // Push image to each selected category's `images` array
    await Promise.all(
      imageCategories.map(catId =>
        ImageCategory.findByIdAndUpdate(catId, {
          $addToSet: { images: saved._id }
        })
      )
    );

    const populated = await saved.populate('imageCategories');
    res.status(201).json(populated);
  } catch (err) {
    console.error('🔥 Upload error:', err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH update image
exports.updateImage = async (req, res) => {
  try {
    const { name, description, tags, imageCategories } = req.body;

    const tagArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map(tag => tag.trim())
      : [];

    const newCategories = Array.isArray(imageCategories)
      ? imageCategories
      : typeof imageCategories === 'string'
      ? JSON.parse(imageCategories)
      : [];

    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const prevCategories = image.imageCategories.map(id => id.toString());

    image.name = name || image.name;
    image.description = description || image.description;
    image.tags = tagArray;
    image.imageCategories = newCategories;

    const updated = await image.save();

    // Remove image from deselected categories
    const removedCategories = prevCategories.filter(id => !newCategories.includes(id));
    await Promise.all(
      removedCategories.map(catId =>
        ImageCategory.findByIdAndUpdate(catId, {
          $pull: { images: image._id }
        })
      )
    );

    // Add image to newly selected categories
    const addedCategories = newCategories.filter(id => !prevCategories.includes(id));
    await Promise.all(
      addedCategories.map(catId =>
        ImageCategory.findByIdAndUpdate(catId, {
          $addToSet: { images: image._id }
        })
      )
    );

    const populated = await updated.populate('imageCategories');
    res.json(populated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// DELETE image
exports.deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(image.public_id);
    if (result.result !== 'ok') {
      return res.status(400).json({ success: false, message: 'Failed to delete from Cloudinary' });
    }

    // Remove image ID from all categories
    await ImageCategory.updateMany(
      { images: image._id },
      { $pull: { images: image._id } }
    );

    await Image.findByIdAndDelete(id);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
