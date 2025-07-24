const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../controllers/productController');
const { authenticate, protect } = require('../middleware/middleware.js');

// Route for getting products
router.get('/', getProducts);

// Route for creating a product (protected)
router.post('/', protect, createProduct);

module.exports = router;