const express = require('express');
const router = express.Router();
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/webstoreServiceController');

// Base route: /api/webstore-services

// Get all services or create a new service
router
  .route('/')
  .get(getServices)
  .post(/* optional auth middleware, */ createService);

// Update or delete a specific service by ID
router
  .route('/:id')
  .put(/* optional auth middleware, */ updateService)
  .delete(/* optional auth middleware, */ deleteService);

module.exports = router;
