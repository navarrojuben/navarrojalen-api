const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  topUpCredits,
  deductCredits,
  transferCredits,
} = require('../controllers/webstoreCreditsController');

// All routes below are protected
router.post('/topup', authMiddleware, topUpCredits);
router.post('/deduct', authMiddleware, deductCredits);
router.post('/transfer', authMiddleware, transferCredits);

module.exports = router;
