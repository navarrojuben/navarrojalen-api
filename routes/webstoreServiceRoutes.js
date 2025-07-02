const express = require('express');
const router = express.Router();
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/webstoreServiceController');

// /api/webstore-services
router.route('/')
  .get(getServices)
  .post(createService);

router.route('/:id')
  .put(updateService)
  .delete(deleteService);

module.exports = router;
