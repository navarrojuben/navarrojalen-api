const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserInfo,
  getAllUsers
} = require('../controllers/webstoreUserController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/webstore-users/register
router.post('/register', registerUser);

// @route   POST /api/webstore-users/login
router.post('/login', loginUser);

// @route   GET /api/webstore-users/userinfo (protected)
router.get('/userinfo', authMiddleware, getUserInfo);

// @route   GET /api/webstore-users (admin access assumed)
router.get('/', getAllUsers);

module.exports = router;
