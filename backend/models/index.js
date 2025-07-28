const User = require('./userModel');
const Product = require('./productModel');
const Order = require('./orderModel');
const OrderItem = require('./orderItemModel');
const { sequelize } = require('../config/database');

// Define associations between models

// One user can have many orders
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// One order can have many order items
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'order_items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// One product can have many order items
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Function to sync all models with the database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    const queryInterface = sequelize.getQueryInterface();
    const existingTables = await queryInterface.showAllTables();

    const models = [
      { name: 'User', model: User },
      { name: 'Product', model: Product },
      { name: 'Order', model: Order },
      { name: 'OrderItem', model: OrderItem },
    ];

    for (const { name, model } of models) {
      const tableName = model.getTableName();
      if (existingTables.includes(tableName)) {
        console.log(`✔ Table "${tableName}" already exists`);
      } else {
        await model.sync(); // create only if not exists
        console.log(`✅ Table "${tableName}" created`);
      }
    }
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
};

module.exports = {
  User,
  Product,
  Order,
  OrderItem,
  syncDatabase,
};

