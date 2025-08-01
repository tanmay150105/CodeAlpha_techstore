// backend/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.MYSQL_DATABASE || 'techstore',
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'admin',
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ DB connection failed:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};

