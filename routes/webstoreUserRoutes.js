const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserInfo,
  getAllUsers,
  updateCredits,
  deleteUser,
  updateUserProfile
} = require('../controllers/webstoreUserController');

const authMiddleware = require('../middleware/authMiddleware');

// @desc    Register new user
// @route   POST /api/webstore-users/register
router.post('/register', registerUser);

// @desc    Login existing user
// @route   POST /api/webstore-users/login
router.post('/login', loginUser);

// @desc    Get current user's info (requires JWT)
// @route   GET /api/webstore-users/userinfo
router.get('/userinfo', authMiddleware, getUserInfo);

// @desc    Get all users (admin access via header)
// @route   GET /api/webstore-users
router.get('/', getAllUsers);

// @desc    Update NJ credits (admin only)
// @route   PUT /api/webstore-users/:id/credits
router.put('/:id/credits', updateCredits);

// @desc    Delete user (admin only)
// @route   DELETE /api/webstore-users/:id
router.delete('/:id', deleteUser);

// @desc    Update user's profile (requires JWT)
// @route   PUT /api/webstore-users/update-profile
router.put('/update-profile', authMiddleware, updateUserProfile);

module.exports = router;
