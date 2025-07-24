const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { userValidation } = require('../utils/validation');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Use centralized validation utility
    const validation = userValidation.validateRegistration({ name, email, password });
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    const { name: validName, email: validEmail, password: validPassword } = validation.sanitized;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email: validEmail } });

    if (userExists) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = await User.create({
      name: validName,
      email: validEmail,
      password: validPassword,
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use centralized validation utility
    const validation = userValidation.validateLogin({ email, password });
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    const { email: validEmail, password: validPassword } = validation.sanitized;

    // Find user by email
    const user = await User.findOne({ where: { email: validEmail } });

    // Check if user exists and password is correct
    if (user && (await user.matchPassword(validPassword))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
