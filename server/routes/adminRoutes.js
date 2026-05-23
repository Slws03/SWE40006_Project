const express = require('express');
const multer = require('multer');
const { requireAdmin } = require('../middleware/auth');
const { createProduct, getAllOrders } = require('../controllers/adminController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/products', requireAdmin, upload.single('image'), createProduct);
router.get('/orders', requireAdmin, getAllOrders);

module.exports = router;
