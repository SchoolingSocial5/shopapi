import { Request, Response } from 'express';
import Expense from '../models/Expense';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    const mappedExpenses = expenses.map(e => ({
      ...e.toObject(),
      id: e.id,
      receipt_path: e.receiptPath || "",
    }));
    res.json(mappedExpenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  const { title, amount, category, date, description } = req.body;
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
    });
    
    res.status(201).json({
      ...expense.toObject(),
      id: expense.id,
      receipt_path: expense.receiptPath || "",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    // Basic mapping for updates
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
      receipt_path: expense.receiptPath || "",
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
