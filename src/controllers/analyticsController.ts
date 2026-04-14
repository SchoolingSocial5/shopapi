import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Expense from '../models/Expense';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    // Total Revenue
    const orders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount as any), 0);

    // Total Expenses
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((acc, expense) => acc + (expense.amount as any), 0);

    // Recent Orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalOrders,
      totalProducts,
      totalRevenue,
      totalExpenses,
      recentOrders,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
