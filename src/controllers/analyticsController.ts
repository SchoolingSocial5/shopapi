import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Expense from '../models/Expense';
import User from '../models/User';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const from = req.query.from as string;
    const to = req.query.to as string;

    let filterOrder: any = {};
    let filterUser: any = { role: { $in: ['customer', 'user'] } };

    if (from && to) {
      const startDate = new Date(from);
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      
      filterOrder.createdAt = { $gte: startDate, $lte: endDate };
      filterUser.createdAt = { $gte: startDate, $lte: endDate };
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Total counts (filtered by date-range if provided, or all-time)
    const totalOrders = await Order.countDocuments(filterOrder);
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments(filterUser);

    const paidOrders = await Order.find({ ...filterOrder, paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const totalSales = paidOrders.reduce((acc, order) => {
      return acc + order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }, 0);

    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((acc, expense) => acc + (expense.amount || 0), 0);

    // Today specific summary
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayOrdersCount = await Order.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } });
    const todayCustomersCount = await User.countDocuments({ role: { $in: ['customer', 'user'] }, createdAt: { $gte: startOfToday, $lte: endOfToday } });

    const todayPaidOrders = await Order.find({ paymentStatus: 'paid', createdAt: { $gte: startOfToday, $lte: endOfToday } });
    const todaySalesAmount = todayPaidOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const todayItemsSoldAmount = todayPaidOrders.reduce((acc, order) => {
      return acc + order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }, 0);

    // Trend Calculations (Period A: last 24h, Period B: 24h to 48h ago)
    const getPeriodStats = async (start: Date, end: Date) => {
      const orders = await Order.find({ createdAt: { $gte: start, $lt: end } });
      const customers = await User.countDocuments({ role: { $in: ['customer', 'user'] }, createdAt: { $gte: start, $lt: end } });
      const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((acc, o) => acc + (o.totalAmount || 0), 0);
      const sales = orders.filter(o => o.paymentStatus === 'paid').reduce((acc, o) => {
        return acc + o.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      }, 0);

      return { ordersCount: orders.length, customers, revenue, sales };
    };

    const currentPeriod = await getPeriodStats(twentyFourHoursAgo, now);
    const previousPeriod = await getPeriodStats(fortyEightHoursAgo, twentyFourHoursAgo);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentCustomers = await User.find({ role: { $in: ['customer', 'user'] } }).sort({ createdAt: -1 }).limit(5);

    res.json({
      total_orders: totalOrders,
      total_products: totalProducts,
      total_customers: totalCustomers,
      total_revenue: totalRevenue,
      total_sales: totalSales,
      total_expenses: totalExpenses,
      recent_orders: recentOrders,
      recent_customers: recentCustomers,
      // Today summary
      today_sales: todaySalesAmount,
      today_customers: todayCustomersCount,
      today_orders: todayOrdersCount,
      today_items_sold: todayItemsSoldAmount,
      // Trends
      orders_trend: calculateTrend(currentPeriod.ordersCount, previousPeriod.ordersCount),
      orders_positive: currentPeriod.ordersCount >= previousPeriod.ordersCount,
      revenue_trend: calculateTrend(currentPeriod.revenue, previousPeriod.revenue),
      revenue_positive: currentPeriod.revenue >= previousPeriod.revenue,
      customers_trend: calculateTrend(currentPeriod.customers, previousPeriod.customers),
      customers_positive: currentPeriod.customers >= previousPeriod.customers,
      sales_trend: calculateTrend(currentPeriod.sales, previousPeriod.sales),
      sales_positive: currentPeriod.sales >= previousPeriod.sales,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
