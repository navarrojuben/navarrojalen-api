const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

const { videoUpload } = require('../config/cloudinaryConfig');

// GET all videos
router.get('/', videoController.getVideos);

// Daily upload count
router.get('/daily-upload-count', videoController.getDailyUploadCount);

// Upload video (Cloudinary via multer-storage-cloudinary)
router.post('/upload', videoUpload.single('file'), videoController.uploadVideo);

// Update video
router.patch('/:id', videoController.updateVideo);

// Delete video
router.delete('/:id', videoController.deleteVideo);

module.exports = router;
