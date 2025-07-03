const WebstoreOrder = require('../models/webstoreOrderModel');

// Utility: Check if request is from admin frontend
const isFromAdminFrontend = (req) => req.headers['x-admin-auth'] === 'navarrojuben';

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/webstore-orders
 */
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

/**
 * @desc    Create a new order (Public)
 * @route   POST /api/webstore-orders
 */
const createOrder = async (req, res) => {
  const {
    items,
    totalAmount,
    note,
    customerName,
    customerEmail,
    customerAddress,
  } = req.body;

  // Validate required fields
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items array is required' });
  }

  if (!totalAmount || !customerName || !customerEmail) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newOrder = await WebstoreOrder.create({
      items,
      totalAmount,
      note: note || '',
      customerName,
      customerEmail,
      customerAddress: customerAddress || '',
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

/**
 * @desc    Get orders for a specific email (instead of customerId)
 * @route   GET /api/webstore-orders/my-orders?email=xxx
 */
const getUserOrders = async (req, res) => {
  const email = req.query.email || req.headers['x-user-email'];

  if (!email) {
    return res.status(400).json({ message: 'Missing user email' });
  }

  try {
    const orders = await WebstoreOrder.find({ customerEmail: email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user orders', error: err.message });
  }
};

/**
 * @desc    Get a single order by ID
 * @route   GET /api/webstore-orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const order = await WebstoreOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

/**
 * @desc    Update an order (Admin only)
 * @route   PUT /api/webstore-orders/:id
 */
const updateOrderStatus = async (req, res) => {
  if (!isFromAdminFrontend(req)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const updatedOrder = await WebstoreOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};

/**
 * @desc    Delete an order (Admin only)
 * @route   DELETE /api/webstore-orders/:id
 */
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

// Export all controller functions
module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
