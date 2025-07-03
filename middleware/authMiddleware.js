const jwt = require('jsonwebtoken');
const User = require('../models/webstoreUserModel');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned' });
    }

    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      address: user.address,
      contactNumber: user.contactNumber,
      role: user.role,
      njCredits: user.njCredits,
      avatar: user.avatar,
    };

    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
    return res.status(401).json({ message: msg });
  }
};

module.exports = authMiddleware;
