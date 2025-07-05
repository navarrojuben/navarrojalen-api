const express = require('express');
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getCooldownInfo,
  deleteOrdersByUserId,
  getOrderCountByUserId,
  deleteOrdersByIds, // ✅ Import bulk delete handler
} = require('../controllers/webstoreOrderController');

const router = express.Router();

// ✅ Middleware: Admin route protection
const isFromAdminFrontend = (req, res, next) => {
  if (req.headers['x-admin-auth'] !== 'navarrojuben') {
    return res.status(403).json({ message: 'Admin access denied' });
  }
  next();
};

/**
 * 🔒 Admin-only Routes
 */

// Get all orders
router.get('/', isFromAdminFrontend, getAllOrders);

// Get order count for a specific user
router.get('/user/:userId/count', isFromAdminFrontend, getOrderCountByUserId);

// Delete all orders by user ID
router.delete('/by-user/:userId', isFromAdminFrontend, deleteOrdersByUserId);

// ✅ NEW: Delete multiple orders by IDs
router.delete('/by-ids', isFromAdminFrontend, deleteOrdersByIds);

// Update order status by ID
router.put('/:id', isFromAdminFrontend, updateOrderStatus);

// Delete single order by ID
router.delete('/:id', isFromAdminFrontend, deleteOrder);

/**
 * 🔓 Public/User Routes
 */

// Create a new order
router.post('/', createOrder);

// Get current user's orders
router.get('/my-orders', getUserOrders);

// Get cooldown info for a user
router.get('/cooldown', getCooldownInfo);

// Get one order by ID
router.get('/:id', getOrderById);

module.exports = router;
