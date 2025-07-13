// config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Separate storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'videos',
    resource_type: 'video', // MUST be set for video uploads
    format: async (req, file) => 'mp4', // Optional, force format
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
  },
});

module.exports = {
  cloudinary,
  videoUpload: require('multer')({ storage: videoStorage }),
};
