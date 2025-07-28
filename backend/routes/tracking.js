const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Track user login
router.post('/login', trackingController.trackLogin);

// Track user logout
router.post('/logout', trackingController.trackLogout);

// Track product view
router.post('/product-view', trackingController.trackProductView);

// Track add to cart
router.post('/add-to-cart', trackingController.trackAddToCart);

// Track remove from cart
router.post('/remove-from-cart', trackingController.trackRemoveFromCart);

// Track checkout start
router.post('/checkout-start', trackingController.trackCheckoutStart);

// Track checkout complete
router.post('/checkout-complete', trackingController.trackCheckoutComplete);

// Track page visit
router.post('/page-visit', trackingController.trackPageVisit);

module.exports = router;
