const express = require('express');
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/webstoreOrderController');

const router = express.Router();

// Utility middleware to check if the request is from admin
const isFromAdminFrontend = (req, res, next) => {
  if (req.headers['x-admin-auth'] !== 'navarrojuben') {
    return res.status(403).json({ message: 'Admin access denied' });
  }
  next();
};

// Create a new order (public or logged-in users depending on frontend handling)
router.post('/', createOrder);

// Get all orders (admin only)
router.get('/', isFromAdminFrontend, getAllOrders);

// Get current user's orders (frontend must send userId in header or query)
router.get('/my-orders', getUserOrders);

// Get one order by ID
router.get('/:id', getOrderById);

// Update order status (admin only)
router.put('/:id', isFromAdminFrontend, updateOrderStatus);

// Delete order (admin only)
router.delete('/:id', isFromAdminFrontend, deleteOrder);

module.exports = router;
