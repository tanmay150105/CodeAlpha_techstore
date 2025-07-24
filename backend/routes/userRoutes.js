const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/middleware.js');

// Route for user registration
router.post('/', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for getting user profile (protected)
router.get('/profile', protect, getUserProfile);

module.exports = router;