const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateController');

router.post('/', dateController.createDate);
router.get('/', dateController.getAllDates);
router.get('/:id', dateController.getDateById);
router.patch('/:id', dateController.updateDate);
router.delete('/:id', dateController.deleteDate);

module.exports = router;
