const { Product } = require('../models');
const { Op } = require('sequelize');

// Get all products (optional filtering by category)
const getProducts = async (req, res) => {
  try {
    const category = req.query.category || '';
    const whereClause = category && category !== 'all' ? { category } : {};

    const products = await Product.findAll({ where: whereClause });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, image, imageAlt } = req.body;

    const product = await Product.create({
      name,
      price,
      description,
      category,
      image,
      imageAlt,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct };
