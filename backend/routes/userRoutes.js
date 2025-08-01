// controllers/userController.js

const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Utility to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// POST /api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      id: user.id,
      name: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  loginUser,
  // other controllers...
};
