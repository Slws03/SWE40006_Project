const express = require('express');
const multer = require('multer');
const { requireAdmin } = require('../middleware/auth');
const { createProduct, updateProduct, getAllOrders, deleteProduct } = require('../controllers/adminController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/products', requireAdmin, upload.single('image'), createProduct);
router.put('/products/:id', requireAdmin, upload.single('image'), updateProduct);
router.delete('/products/:id', requireAdmin, deleteProduct);
router.get('/orders', requireAdmin, getAllOrders);

module.exports = router;
