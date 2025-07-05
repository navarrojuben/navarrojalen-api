const User = require('../models/webstoreUserModel');
const WebstoreChat = require('../models/webstoreChatModel');
const Order = require('../models/webstoreOrderModel');
const jwt = require('jsonwebtoken');

// Create JWT
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc Register new user
// @route POST /api/webstore-users/register
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, avatar, name, address, contactNumber } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      avatar: avatar || '',
      name: name || '',
      address: address || '',
      contactNumber: contactNumber || '',
    });

    const token = createToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        address: newUser.address,
        contactNumber: newUser.contactNumber,
        role: newUser.role,
        njCredits: newUser.njCredits,
        avatar: newUser.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// @desc Login user (by email or username)
// @route POST /api/webstore-users/login
exports.loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        address: user.address,
        contactNumber: user.contactNumber,
        role: user.role,
        njCredits: user.njCredits,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// @desc Get user info (requires JWT token)
// @route GET /api/webstore-users/userinfo
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      address: user.address,
      contactNumber: user.contactNumber,
      role: user.role,
      njCredits: user.njCredits,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// @desc Get all users (admin access via custom header)
// @route GET /api/webstore-users
exports.getAllUsers = async (req, res) => {
  const isFromAdminFrontend = req.headers['x-admin-auth'] === 'navarrojuben';
  if (!isFromAdminFrontend) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// @desc Update NJ Credits (admin only)
// @route PUT /api/webstore-users/:id/credits
exports.updateCredits = async (req, res) => {
  const isFromAdminFrontend = req.headers['x-admin-auth'] === 'navarrojuben';
  if (!isFromAdminFrontend) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { id } = req.params;
  const { njCredits } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { njCredits },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Credits updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update credits', error: err.message });
  }
};

// ✅ @desc Delete a user and associated messages & orders (admin only)
// @route DELETE /api/webstore-users/:id
exports.deleteUser = async (req, res) => {
  const isFromAdminFrontend = req.headers['x-admin-auth'] === 'navarrojuben';
  if (!isFromAdminFrontend) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Delete WebstoreChat messages
    const deletedMessages = await WebstoreChat.deleteMany({ user: id });

    // ✅ Delete WebstoreOrders with subdocument user._id match
    const deletedOrders = await Order.deleteMany({ 'user._id': id });

    // ✅ Delete the user last
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: `User ${user.username} deleted successfully.`,
      deletedMessages: deletedMessages.deletedCount,
      deletedOrders: deletedOrders.deletedCount,
    });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// @desc Update user profile (name, address, avatar, contactNumber)
// @route PUT /api/webstore-users/update-profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, address, avatar, contactNumber } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.address = address || user.address;
    user.contactNumber = contactNumber || user.contactNumber;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      message: 'Profile updated',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        address: user.address,
        contactNumber: user.contactNumber,
        avatar: user.avatar,
        njCredits: user.njCredits,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};
