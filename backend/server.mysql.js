const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection, sequelize } = require('./config/database');
const { syncDatabase } = require('./models/index');

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const trackingRoutes = require('./routes/tracking');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from docs
app.use(express.static(path.join(__dirname, '../docs')));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tracking', trackingRoutes);

// Root API route
app.get('/api', (req, res) => {
  res.json({ message: 'TechStore API is running with MySQL...' });
});

// Serve docs for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/index.html'));
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection
  await testConnection();
  
  // Sync database (create tables)
  try {
    await syncDatabase();
    console.log('All database tables created successfully!');
  } catch (error) {
    console.error('Database sync failed:', error);
  }
});
