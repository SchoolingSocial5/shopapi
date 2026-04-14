import { Request, Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { customer_name, customer_email, customer_phone, delivery_address, items, total_amount, notes } = req.body;

  try {
    const order = await Order.create({
      userId: req.user ? req.user.id : null,
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone,
      deliveryAddress: delivery_address,
      items,
      totalAmount: total_amount,
      notes,
    });
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const mappedOrders = orders.map(o => ({
      ...o.toObject(),
      id: o.id,
      customer_name: o.get('customerName'),
      customer_email: o.get('customerEmail'),
      customer_phone: o.get('customerPhone'),
      delivery_address: o.get('deliveryAddress'),
      total_amount: o.get('totalAmount'),
      created_at: o.get('createdAt'),
    }));

    res.json({
      orders: mappedOrders,
      pagination: {
        total,
        page,
        last_page: Math.ceil(total / limit),
        per_page: limit,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status, paymentStatus } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status, paymentStatus } },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await order.deleteOne();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
