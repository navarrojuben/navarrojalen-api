const WebstoreOrder = require('../models/webstoreOrderModel');
const WebstoreUser = require('../models/webstoreUserModel');

const mongoose = require('mongoose');


// Utility: Check if request is from admin frontend
const isFromAdminFrontend = (req) => req.headers['x-admin-auth'] === 'navarrojuben';

// GET /api/webstore-orders
const getAllOrders = async (req, res) => {
  if (!isFromAdminFrontend(req)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const orders = await WebstoreOrder.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error('getAllOrders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

const sendWebstoreOrderEmail = require('../utils/sendWebstoreOrderEmail'); // Add this import at the top

// POST /api/webstore-orders
const createOrder = async (req, res) => {
  const { user, items, total, note } = req.body;

  if (
    !user || !user._id || !user.email ||
    !Array.isArray(items) || items.length === 0 || !total
  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const userId = new mongoose.Types.ObjectId(user._id);

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recentOrders = await WebstoreOrder.find({
      'user._id': userId,
      createdAt: { $gte: threeDaysAgo },
    });

    if (recentOrders.length >= 3) {
      const remaining = 0;
      return res.status(429).json({
        message: `Order limit reached (3 per 3 days). Try again later.`,
        remaining,
      });
    }

    const existingUser = await WebstoreUser.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (existingUser.njCredits < total) {
      return res.status(400).json({ message: 'Insufficient NJ credits' });
    }

    existingUser.njCredits -= total;
    await existingUser.save();

    const newOrder = await WebstoreOrder.create({
      user,
      items,
      total,
      note: note || '',
    });

    const remaining = 3 - recentOrders.length - 1;

    // ✅ Send email notification after successful order creation
    try {
      await sendWebstoreOrderEmail(newOrder);
    } catch (emailErr) {
      console.error('Failed to send email notification:', emailErr.message);
    }

    res.status(201).json({ order: newOrder, remaining });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};


// GET /api/webstore-orders/my-orders?email=xxx
const getUserOrders = async (req, res) => {
  const email = req.query.email || req.headers['x-user-email'];
  if (!email) {
    return res.status(400).json({ message: 'Missing user email' });
  }

  try {
    const orders = await WebstoreOrder.find({ 'user.email': email }).sort({ createdAt: -1 });

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recentCount = orders.filter(order => new Date(order.createdAt) >= threeDaysAgo).length;
    const remaining = Math.max(0, 3 - recentCount);

    res.status(200).json({ orders, remaining });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user orders', error: err.message });
  }
};

// GET /api/webstore-orders/cooldown?email=xxx
const getCooldownInfo = async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const recentOrders = await WebstoreOrder.find({
      'user.email': email,
      createdAt: { $gte: threeDaysAgo },
    }).sort({ createdAt: 1 });

    const remainingOrders = Math.max(0, 3 - recentOrders.length);
    let nextAvailable = null;

    if (recentOrders.length >= 3) {
      const firstOrder = recentOrders[0];
      nextAvailable = new Date(firstOrder.createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
    }

    res.json({ remainingOrders, nextAvailable });
  } catch (err) {
    console.error('Cooldown check error:', err);
    res.status(500).json({ message: 'Failed to check cooldown', error: err.message });
  }
};

// GET /api/webstore-orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await WebstoreOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

// PUT /api/webstore-orders/:id
const updateOrderStatus = async (req, res) => {
  if (!isFromAdminFrontend(req)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { status } = req.body;

  try {
    const order = await WebstoreOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status === 'cancelled' && order.status !== 'cancelled') {
      const userId = order.user._id;
      const refundAmount = order.total;

      const user = await WebstoreUser.findById(userId);
      if (user) {
        user.njCredits += refundAmount;
        await user.save();
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};

// DELETE /api/webstore-orders/:id
const deleteOrder = async (req, res) => {
  if (!isFromAdminFrontend(req)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const deletedOrder = await WebstoreOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getCooldownInfo,
};
