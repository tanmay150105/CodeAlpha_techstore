const express = require('express');
const router = express.Router();
const { getUserOrders, createOrder } = require('../controllers/orderController');
const { authenticate, protect } = require('../middleware/middleware.js');

// Route for getting orders (protected)
router.get('/', protect, getUserOrders);

// Route for creating an order (protected)
router.post('/', protect, createOrder);

module.exports = router;