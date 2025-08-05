const { Order, OrderItem, Product, User } = require('../models');
const { sequelize } = require('../config/database');

// Create new order
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

    // Step 1: Create the order
    const order = await Order.create({
      user_id: req.user.id,
      total_amount: totalPrice,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
    }, { transaction: t });

    // Step 2: Add all items to order_items
    await Promise.all(orderItems.map(item => {
      return OrderItem.create({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
      }, { transaction: t });
    }));

    // Step 3: Commit transaction (cart clearing is handled on frontend)
    await t.commit();

    // Step 4: Return order with included items
    const createdOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'order_items' }]
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'order_items',
          include: [{ model: Product }]
        },
        {
          model: User,
          attributes: ['name', 'email']
        }
      ]
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark order as paid
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user_id !== req.user.id) {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for logged-in user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: 'order_items' }],
      order: [['id', 'DESC']] // Use id instead of createdAt since timestamps are disabled
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  getUserOrders,
};
