import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController';
import { protect, adminOnly } from '../middleware/auth';

import upload from '../middleware/upload';

const router = Router();

router.get('/', protect, adminOnly, getExpenses);
router.post('/', protect, adminOnly, upload.single('receipt'), createExpense);
router.post('/:id', protect, adminOnly, upload.single('receipt'), updateExpense);
router.put('/:id', protect, adminOnly, upload.single('receipt'), updateExpense);
router.delete('/:id', protect, adminOnly, deleteExpense);

export default router;
