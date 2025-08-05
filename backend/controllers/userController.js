const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models');
const { userValidation } = require('../utils/validation');

// Generate JWT token
const generateToken = (id) => {
  // Fallback JWT secret if environment variable is not loaded
  const jwtSecret = process.env.JWT_SECRET || 'techstore_fallback_secret_key_2025_deadline_fix';
  
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Register new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const validation = userValidation.validateRegistration({ name, email, password });

    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    const { name: validName, email: validEmail, password: validPassword } = validation.sanitized;

    const userExists = await User.findOne({ where: { email: validEmail } });

    if (userExists) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      username: validName,
      full_name: validName,
      email: validEmail,
      password: validPassword,
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validation = userValidation.validateLogin({ email, password });

    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    const { email: validEmail, password: validPassword } = validation.sanitized;

    const user = await User.findOne({ where: { email: validEmail } });

    if (user && (await user.matchPassword(validPassword))) {
      const token = generateToken(user.id);

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      res.json({
        id: user.id,
        username: user.username,
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
