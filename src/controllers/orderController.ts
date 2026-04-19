import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';
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
  const body = req.body || {};
  const { 
    customer_name, 
    customer_email, 
    customer_phone, 
    delivery_address, 
    items, 
    total_amount, 
    notes,
    password,
    payment_method 
  } = body;

  if (!customer_name || !customer_phone) {
    return res.status(400).json({ 
      message: 'Missing customer details. Please provide name and phone number.',
      received_body: req.body // Include body in error for easier debugging
    });
  }

  try {
    let currentUser = req.user;
    
    // Parse items if they are sent as a string (FormData)
    let parsedItems = items;
    if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        console.error('Failed to parse items:', items);
      }
    }

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    // 1. Stock Validation
    for (const item of parsedItems) {
      const product = await Product.findById(item.productId || item.id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productName} not found.` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.productName}. (In stock: ${product.quantity})` });
      }
    }

    // Default password for admin-created users
    const effectivePassword = password || 'Test123$';
    const effectiveEmail = customer_email || (customer_phone ? `${customer_phone}@mail.com` : null);

    // 2. CRM Update / User Lookup
    let userExists = null;
    if (!currentUser) {
      userExists = await User.findOne({ 
        $or: [
          { email: effectiveEmail },
          ...(customer_phone ? [{ phone: customer_phone }] : [])
        ]
      });

      if (userExists) {
        currentUser = { id: userExists.id } as any;
        // Update CRM stats
        userExists.totalOrders = (userExists.totalOrders || 0) + 1;
        userExists.totalSpent = (userExists.totalSpent || 0) + Number(total_amount);
        await userExists.save();
      } else if (effectiveEmail) {
        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(effectivePassword, salt);

        const newUser = await User.create({
          name: customer_name,
          email: effectiveEmail,
          password: hashedPassword,
          phone: customer_phone,
          address: delivery_address || 'Admin Created',
          totalOrders: 1,
          totalSpent: Number(total_amount)
        });

        if (newUser) {
          currentUser = { id: newUser.id } as any;
        }
      }
    } else {
      // If user is logged in, still update stats
      const loggedInUser = await User.findById(currentUser.id);
      if (loggedInUser) {
        loggedInUser.totalOrders = (loggedInUser.totalOrders || 0) + 1;
        loggedInUser.totalSpent = (loggedInUser.totalSpent || 0) + Number(total_amount);
        await loggedInUser.save();
      }
    }

    // 3. Stock Reduction
    for (const item of parsedItems) {
      await Product.findByIdAndUpdate(item.productId || item.id, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Set payment status based on POS method
    const isAdminPayment = ['cash', 'pos', 'transfer'].includes(payment_method);

    // Generate Order ID (Receipt Number)
    const setting = await Setting.findOne();
    const initials = getCompanyInitials(setting?.companyName || 'REC');
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedReceiptNumber = `${initials}-${dateStr}-${randomSuffix}`;

    const order = await Order.create({
      userId: currentUser ? currentUser.id : null,
      customerName: customer_name,
      customerEmail: effectiveEmail,
      customerPhone: customer_phone,
      deliveryAddress: delivery_address,
      items: parsedItems.map(i => ({
        productId: i.productId || i.id,
        productName: i.productName,
        productImage: i.productImage,
        price: i.price,
        quantity: i.quantity
      })),
      totalAmount: total_amount,
      notes,
      paymentMethod: payment_method || 'online',
      paymentStatus: isAdminPayment ? 'paid' : 'unpaid',
      receiptNumber: generatedReceiptNumber,
      approvedBy: req.user ? (req.user.name || req.user.email) : 'POS System',
      receiptPath: req.file ? (req.file as any).location || `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json({
      ...order.toObject(),
      id: order.id
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

    const filter: any = {};
    if (req.query.payment_status) {
      filter.paymentStatus = req.query.payment_status;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
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
