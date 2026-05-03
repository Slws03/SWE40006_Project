const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrder } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);

module.exports = router;
