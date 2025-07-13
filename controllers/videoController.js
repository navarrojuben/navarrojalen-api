const Video = require('../models/videoModel');
const ImageCategory = require('../models/imageCategoryModel');

// GET all videos
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find({
      url: { $regex: /\.(mp4|mov|avi|webm|mkv)$/i },
    })
      .sort({ createdAt: -1 })
      .populate('imageCategories');

    res.json(videos);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST upload video
exports.uploadVideo = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Sanitize tags
    const rawTags = req.body.tags;
    const tags = Array.isArray(rawTags)
      ? rawTags
      : typeof rawTags === 'string'
      ? JSON.parse(rawTags)
      : [];

    // Sanitize imageCategories
    const rawCategories = req.body.imageCategories;
    const imageCategories = Array.isArray(rawCategories)
      ? rawCategories.filter(id => id && id.trim())
      : typeof rawCategories === 'string'
      ? JSON.parse(rawCategories).filter(id => id && id.trim())
      : [];

    // Validate file
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const isVideo = /\.(mp4|mov|avi|webm|mkv)$/i.test(req.file.path);
    if (!isVideo) {
      return res.status(400).json({ message: 'Invalid video file format' });
    }

    const video = new Video({
      name,
      description: description || '',
      tags,
      imageCategories,
      url: req.file.path,
      public_id: req.file.filename,
    });

    const saved = await video.save();

    // Push video ID to each selected category
    await Promise.all(
      imageCategories.map(catId =>
        ImageCategory.findByIdAndUpdate(catId, {
          $addToSet: { images: saved._id },
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

// PATCH update video
exports.updateVideo = async (req, res) => {
  try {
    const { name, description, tags, imageCategories } = req.body;

    const tagArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map(tag => tag.trim())
      : [];

    const newCategories = Array.isArray(imageCategories)
      ? imageCategories.filter(id => id && id.trim())
      : typeof imageCategories === 'string'
      ? JSON.parse(imageCategories).filter(id => id && id.trim())
      : [];

    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const prevCategories = video.imageCategories.map(id => id.toString());

    video.name = name || video.name;
    video.description = description || video.description;
    video.tags = tagArray;
    video.imageCategories = newCategories;

    const updated = await video.save();

    // Remove from old categories
    const removedCategories = prevCategories.filter(id => !newCategories.includes(id));
    await Promise.all(
      removedCategories.map(catId =>
        ImageCategory.findByIdAndUpdate(catId, {
          $pull: { images: video._id },
        })
      )
    );

    // Add to new categories
    const addedCategories = newCategories.filter(id => !prevCategories.includes(id));
    await Promise.all(
      addedCategories.map(catId =>
        ImageCategory.findByIdAndUpdate(catId, {
          $addToSet: { images: video._id },
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

// DELETE video
exports.deleteVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const cloudinary = require('cloudinary').v2;
    const result = await cloudinary.uploader.destroy(video.public_id, {
      resource_type: 'video',
    });

    if (result.result !== 'ok') {
      return res.status(400).json({ success: false, message: 'Failed to delete from Cloudinary' });
    }

    await ImageCategory.updateMany(
      { images: video._id },
      { $pull: { images: video._id } }
    );

    await Video.findByIdAndDelete(id);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Daily upload count
exports.getDailyUploadCount = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const count = await Video.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    res.status(200).json({ count });
  } catch (err) {
    console.error('Error fetching daily video upload count:', err);
    res.status(500).json({ error: 'Failed to fetch daily upload count.' });
  }
};
