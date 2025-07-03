const User = require('../models/webstoreUserModel');

// @route   POST /api/webstore-credits/topup
exports.topUpCredits = async (req, res) => {
  const { amount, userId } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid top-up amount' });
  }

  try {
    const user = await User.findById(userId || req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.njCredits += amount;
    await user.save();

    res.json({ message: 'Credits topped up', njCredits: user.njCredits });
  } catch (err) {
    res.status(500).json({ message: 'Top-up failed', error: err.message });
  }
};

// @route   POST /api/webstore-credits/deduct
exports.deductCredits = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid deduction amount' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.njCredits < amount) {
      return res.status(400).json({ message: 'Not enough credits' });
    }

    user.njCredits -= amount;
    await user.save();

    res.json({ message: 'Credits deducted', njCredits: user.njCredits });
  } catch (err) {
    res.status(500).json({ message: 'Deduction failed', error: err.message });
  }
};

// @route   POST /api/webstore-credits/transfer
exports.transferCredits = async (req, res) => {
  const { amount, toUsername } = req.body;

  if (!amount || amount <= 0 || !toUsername) {
    return res.status(400).json({ message: 'Invalid transfer request' });
  }

  try {
    const fromUser = await User.findById(req.user.id);
    const toUser = await User.findOne({ username: toUsername });

    if (!toUser) return res.status(404).json({ message: 'Recipient not found' });

    if (fromUser.njCredits < amount) {
      return res.status(400).json({ message: 'Not enough credits to transfer' });
    }

    fromUser.njCredits -= amount;
    toUser.njCredits += amount;

    await fromUser.save();
    await toUser.save();

    res.json({
      message: `Transferred ${amount} NJ Credits to ${toUser.username}`,
      remainingCredits: fromUser.njCredits,
    });
  } catch (err) {
    res.status(500).json({ message: 'Transfer failed', error: err.message });
  }
};
