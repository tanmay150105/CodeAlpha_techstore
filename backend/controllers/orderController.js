const { Order, OrderItem, Product, User } = require('../models');
const { sequelize } = require('../config/database');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;
    
    if (!orderItems || orderItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'No order items' });
    }
    
    // Create order in database
    const order = await Order.create({
      userId: req.user.id,
      shippingAddress,
      paymentMethod,
      totalPrice,
    }, { transaction: t });
    
    // Create order items
    const createdOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        return await OrderItem.create({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          productId: item.productId,
          orderId: order.id,
        }, { transaction: t });
      })
    );
    
    await t.commit();
    
    // Return the created order with items
    const createdOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'orderItems'
      }]
    });
    
    res.status(201).json(createdOrder);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    // Find order and include order items and user info
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product }]
        },
        {
          model: User,
          attributes: ['name', 'email']
        }
      ]
    });
    
    if (order) {
      // Check if order belongs to logged in user
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this order' });
      }
      
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    
    if (order) {
      // Check if order belongs to logged in user
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
      
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        updateTime: req.body.updateTime,
        emailAddress: req.body.emailAddress,
      };
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    // Find all orders for the logged in user
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'orderItems'
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrderById, updateOrderToPaid, getUserOrders };
