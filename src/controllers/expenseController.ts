import { Request, Response } from 'express';
import Expense from '../models/Expense';

export const getExpenses = async (req: any, res: Response) => {
  try {
    const { from, to } = req.query;
    let query: any = {};
    
    // If not provided at all (default load), show today's expenses
    const defaultFrom = from !== undefined ? from : new Date().toISOString().split('T')[0];
    const defaultTo = to !== undefined ? to : new Date().toISOString().split('T')[0];

    if (defaultFrom || defaultTo) {
      query.date = {};
      if (defaultFrom) query.date.$gte = new Date(defaultFrom as string);
      if (defaultTo) {
        const toDate = new Date(defaultTo as string);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    const user = req.user;
    const isSuper = !user || user.role === 'admin' || user.status === 'admin' || user.staffPosition === 'Director' || user.staffPosition === 'Developer';
    
    if (!isSuper) {
      const staffType = user.staffType || user.staff_type || 'Retail';
      query.$or = [
        { department: staffType },
        { department: 'All' },
        { department: { $exists: false } }
      ];
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    const mappedExpenses = expenses.map(e => ({
      ...e.toObject(),
      id: e.id,
      receipt_url: e.receiptPath || "",
      recorded_by: e.recorded_by || "System",
    }));
    res.json(mappedExpenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req: any, res: Response) => {
  const { title, amount, category, date, description } = req.body;
  const recordedBy = req.user?.name || "Staff";
  const receiptPath = req.file 
    ? (req.file as any).location || `/uploads/${req.file.filename}` 
    : null;

  const user = req.user;
  const isSuper = user && (user.role === 'admin' || user.status === 'admin' || user.staffPosition === 'Director' || user.staffPosition === 'Developer');
  
  let department = 'All';
  if (user && !isSuper) {
    department = user.staffType || user.staff_type || 'Retail';
  }

  try {
    const expense = await Expense.create({
      title,
      amount,
      category,
      date: date || new Date(),
      description,
      receiptPath,
      recorded_by: recordedBy,
      department,
    });
    
    res.status(201).json({
      ...expense.toObject(),
      id: expense.id,
      receipt_url: expense.receiptPath || "",
      recorded_by: expense.recorded_by,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateExpense = async (req: any, res: Response) => {
  try {
    const updateData: any = { ...req.body };
    if (req.body.receipt_path !== undefined) updateData.receiptPath = req.body.receipt_path;

    if (req.file) {
      updateData.receiptPath = (req.file as any).location || `/uploads/${req.file.filename}`;
    }

    const expense = await Expense.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    
    res.json({
      ...expense.toObject(),
      id: expense.id,
      receipt_url: expense.receiptPath || "",
      recorded_by: expense.recorded_by || "System",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
