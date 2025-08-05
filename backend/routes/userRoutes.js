const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/middleware');

// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login  
router.post('/login', loginUser);

// GET /api/users/profile (protected)
router.get('/profile', protect, getUserProfile);

module.exports = router;
