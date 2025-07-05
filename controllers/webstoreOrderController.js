const WebstoreOrder = require('../models/webstoreOrderModel');
const WebstoreUser = require('../models/webstoreUserModel');
const mongoose = require('mongoose');
const sendWebstoreOrderEmail = require('../utils/sendWebstoreOrderEmail');

const isFromAdminFrontend = (req) => req.headers['x-admin-auth'] === 'navarrojuben';

// ✅ GET all orders (admin only)
const getAllOrders = async (req, res) => {
  if (!isFromAdminFrontend(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const orders = await WebstoreOrder.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// ✅ POST create new order
const createOrder = async (req, res) => {
  const { user, items, total, note } = req.body;

  if (!user || !user._id || !user.email || !Array.isArray(items) || items.length === 0 || !total) {
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
      return res.status(429).json({
        message: `Order limit reached (3 per 3 days). Try again later.`,
        remaining: 0,
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

    try {
      await sendWebstoreOrderEmail(newOrder);
    } catch (emailErr) {
      console.error('Failed to send email notification:', emailErr.message);
    }

    res.status(201).json({ order: newOrder, remaining });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

// ✅ GET orders for a specific user (by email)
const getUserOrders = async (req, res) => {
  const email = req.query.email || req.headers['x-user-email'];
  if (!email) return res.status(400).json({ message: 'Missing user email' });

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

// ✅ GET cooldown info
const getCooldownInfo = async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ message: 'Email is required' });

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
    res.status(500).json({ message: 'Failed to check cooldown', error: err.message });
  }
};

// ✅ GET single order
const getOrderById = async (req, res) => {
  try {
    const order = await WebstoreOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

// ✅ PUT update order status
const updateOrderStatus = async (req, res) => {
  if (!isFromAdminFrontend(req)) return res.status(403).json({ message: 'Access denied' });

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

// ✅ DELETE order by ID
const deleteOrder = async (req, res) => {
  if (!isFromAdminFrontend(req)) return res.status(403).json({ message: 'Access denied' });

  try {
    const deletedOrder = await WebstoreOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
};

// ✅ DELETE all orders by user ID
const deleteOrdersByUserId = async (req, res) => {
  if (!isFromAdminFrontend(req)) return res.status(403).json({ message: 'Access denied' });

  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const result = await WebstoreOrder.deleteMany({ 'user._id': userId });
    res.status(200).json({ deletedOrders: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete orders', error: err.message });
  }
};

// ✅ DELETE multiple orders by order IDs
const deleteOrdersByIds = async (req, res) => {
  if (!isFromAdminFrontend(req)) return res.status(403).json({ message: 'Access denied' });

  const { orderIds } = req.body;

  if (!Array.isArray(orderIds) || orderIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
    return res.status(400).json({ message: 'Invalid order IDs' });
  }

  try {
    const result = await WebstoreOrder.deleteMany({ _id: { $in: orderIds } });
    res.status(200).json({ deletedOrders: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete orders', error: err.message });
  }
};

// ✅ GET order count by user ID
const getOrderCountByUserId = async (req, res) => {
  if (!isFromAdminFrontend(req)) return res.status(403).json({ message: 'Access denied' });

  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const count = await WebstoreOrder.countDocuments({ 'user._id': userId });
    res.status(200).json({ count });
  } catch (err) {
    console.error('getOrderCountByUserId error:', err);
    res.status(500).json({ message: 'Failed to get order count', error: err.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  deleteOrdersByUserId,
  deleteOrdersByIds, // ✅ Exported
  getCooldownInfo,
  getOrderCountByUserId,
};
