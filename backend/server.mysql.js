const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection, sequelize } = require('./config/database');
const { syncDatabase } = require('./models/index');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static docs
app.use(express.static(path.join(__dirname, '../docs')));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'healthy', 
      database: 'connected', 
      timestamp: new Date().toISOString(),
      message: 'TechStore API running successfully'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected', 
      error: error.message 
    });
  }
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'TechStore API is running with MySQL',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      health: '/api/health'
    }
  });
});

// Fallback to serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 TechStore Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  
  // Debug environment variables
  console.log('🔍 Environment variables check:');
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing'}`);
  console.log(`   - MYSQL_DATABASE: ${process.env.MYSQL_DATABASE}`);
  
  await testConnection();

  try {
    await syncDatabase();
    console.log('✅ Database tables synced successfully!');
    console.log('🎯 Core e-commerce functionality ready');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
  }
});

