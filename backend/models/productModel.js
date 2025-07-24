const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Product model definition
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['processors', 'graphics', 'memory', 'cooling', 'peripherals']],
    },
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageAlt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Product;
