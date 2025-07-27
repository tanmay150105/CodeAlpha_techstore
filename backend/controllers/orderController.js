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

    const order = await Order.create({
      userId: req.user.id,
      shippingAddress,
      paymentMethod,
      totalPrice,
    }, { transaction: t });

    await Promise.all(orderItems.map(item => {
      return OrderItem.create({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        productId: item.productId,
        orderId: order.id,
      }, { transaction: t });
    }));

    await t.commit();

    const createdOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'orderItems' }]
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
          as: 'orderItems',
          include: [{ model: Product }]
        },
        {
          model: User,
          attributes: ['name', 'email']
        }
      ]
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== req.user.id) {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for logged-in user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: 'orderItems' }],
      order: [['createdAt', 'DESC']]
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
