const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Order model definition
const Order = sequelize.define('Order', {
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    validate: {
      hasRequiredFields(value) {
        if (!value.address || !value.city || !value.postalCode || !value.country) {
          throw new Error('Shipping address must include address, city, postalCode, and country');
        }
      },
    },
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['card', 'upi', 'netbanking', 'cod']],
    },
  },
  paymentResult: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paidAt: {
    type: DataTypes.DATE,
  },
  isDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deliveredAt: {
    type: DataTypes.DATE,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

module.exports = Order;
