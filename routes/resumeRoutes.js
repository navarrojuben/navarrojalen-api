const express = require('express');
const router = express.Router();

const { getResume, updateResume } = require('../controllers/resumeController');

// Public route – get the resume
router.get('/', getResume);

// Admin route – update the resume
// If you want to protect this, add an auth middleware:
// router.put('/', authMiddleware, updateResume);
router.put('/', updateResume);

module.exports = router;
