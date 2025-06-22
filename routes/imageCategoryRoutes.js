// backend/routes/imageCategoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/imageCategoryController');

// CRUD routes
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
