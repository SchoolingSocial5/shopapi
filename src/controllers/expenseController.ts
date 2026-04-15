import { Request, Response } from 'express';
import Expense from '../models/Expense';

export const getExpenses = async (req: any, res: Response) => {
  try {
    const { from, to } = req.query;
    let query: any = {};
    
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from as string);
      if (to) {
        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
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

  try {
    const expense = await Expense.create({
      title,
      amount,
      category,
      date: date || new Date(),
      description,
      receiptPath,
      recorded_by: recordedBy,
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
