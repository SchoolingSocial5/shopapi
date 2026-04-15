import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { generateToken } from '../utils/jwt';
import Setting from '../models/Setting';
import bcrypt from 'bcryptjs';

const getCompanyInitials = (name: string): string => {
  if (!name) return 'REC';
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
  return initials || 'REC';
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { 
    customer_name, 
    customer_email, 
    customer_phone, 
    delivery_address, 
    items, 
    total_amount, 
    notes,
    password 
  } = req.body;

  try {
    let currentUser = req.user;
    let authData = null;

    // Handle guest registration if password is provided and not already logged in
    if (password && !currentUser) {
      const userExists = await User.findOne({ email: customer_email });
      if (userExists) {
        return res.status(400).json({ message: 'A user with this email already exists. Please log in first.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name: customer_name,
        email: customer_email,
        password: hashedPassword,
        phone: customer_phone,
        address: delivery_address,
      });

      if (newUser) {
        currentUser = { id: newUser.id } as any;
        authData = {
          access_token: generateToken({ id: newUser.id }),
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
            phone: newUser.phone,
            address: newUser.address,
          },
        };
      }
    }

    // Parse items if they are sent as a string (FormData)
    let parsedItems = items;
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        console.error('Failed to parse items:', items);
      }
    }

    const order = await Order.create({
      userId: currentUser ? currentUser.id : null,
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone,
      deliveryAddress: delivery_address,
      items: parsedItems,
      totalAmount: total_amount,
      notes,
      receiptPath: req.file ? (req.file as any).location || `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json({
      ...order.toObject(),
      id: order.id,
      auth: authData
    });
  } catch (error: any) {
    console.error('Create Order Error:', error);
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
      payment_status: o.get('paymentStatus'),
      receipt_number: o.get('receiptNumber'),
      approved_by: o.get('approvedBy'),
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

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status, paymentStatus, payment_status } = req.body;
  const finalPaymentStatus = paymentStatus || payment_status;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (finalPaymentStatus) updateData.paymentStatus = finalPaymentStatus;

    // Generate receipt number and track staff if marked as paid
    if (finalPaymentStatus === 'paid' && !order.receiptNumber) {
      const setting = await Setting.findOne();
      const prefix = getCompanyInitials(setting?.companyName || '');
      
      // Count orders that have a receipt number starting with this prefix
      const count = await Order.countDocuments({ receiptNumber: { $regex: new RegExp(`^${prefix}-`) } });
      updateData.receiptNumber = `${prefix}-${count + 1}`;
      
      updateData.approvedBy = req.user?.name || 'Admin';
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const mappedOrder = {
      ...updatedOrder.toObject(),
      id: updatedOrder.id,
      customer_name: updatedOrder.get('customerName'),
      customer_email: updatedOrder.get('customerEmail'),
      customer_phone: updatedOrder.get('customerPhone'),
      delivery_address: updatedOrder.get('deliveryAddress'),
      total_amount: updatedOrder.get('totalAmount'),
      payment_status: updatedOrder.get('paymentStatus'),
      receipt_number: updatedOrder.get('receiptNumber'),
      approved_by: updatedOrder.get('approvedBy'),
      created_at: updatedOrder.get('createdAt'),
    };

    res.json(mappedOrder);
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

export const bulkUpdateStatus = async (req: AuthRequest, res: Response) => {
  const { ids, status, paymentStatus, payment_status } = req.body;
  const finalPaymentStatus = paymentStatus || payment_status;

  try {
    const setting = await Setting.findOne();
    const prefix = getCompanyInitials(setting?.companyName || '');
    
    // Process them to handle individual receipt generation
    const updatedOrders = [];
    for (const id of ids) {
      const order = await Order.findById(id);
      if (!order) continue;

      const updateData: any = {};
      if (status) updateData.status = status;
      if (finalPaymentStatus) updateData.paymentStatus = finalPaymentStatus;

      if (finalPaymentStatus === 'paid' && !order.receiptNumber) {
        const count = await Order.countDocuments({ receiptNumber: { $regex: new RegExp(`^${prefix}-`) } });
        updateData.receiptNumber = `${prefix}-${count + 1}`;
        updateData.approvedBy = req.user?.name || 'Admin';
      }

      const updated = await Order.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      updatedOrders.push(updated);
    }

    res.json({ message: 'Bulk update successful', count: updatedOrders.length });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const bulkDeleteOrders = async (req: Request, res: Response) => {
  const { ids } = req.body;
  try {
    await Order.deleteMany({ _id: { $in: ids } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
