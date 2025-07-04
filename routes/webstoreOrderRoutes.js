const express = require('express');
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getCooldownInfo, // ✅ FIXED NAME
} = require('../controllers/webstoreOrderController');

const router = express.Router();

// Middleware: Verify admin requests
const isFromAdminFrontend = (req, res, next) => {
  if (req.headers['x-admin-auth'] !== 'navarrojuben') {
    return res.status(403).json({ message: 'Admin access denied' });
  }
  next();
};

// Create a new order
router.post('/', createOrder);

// Get all orders (admin only)
router.get('/', isFromAdminFrontend, getAllOrders);

// Get cooldown info for a user (must come before /:id to avoid conflict)
router.get('/cooldown', getCooldownInfo); // ✅ use getCooldownInfo

// Get current user's orders
router.get('/my-orders', getUserOrders);

// Get one order by ID
router.get('/:id', getOrderById);

// Update order status (admin only)
router.put('/:id', isFromAdminFrontend, updateOrderStatus);

// Delete order (admin only)
router.delete('/:id', isFromAdminFrontend, deleteOrder);

module.exports = router;
