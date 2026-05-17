import { Router } from 'express';
import { getFinanceData } from '../controllers/financeController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, adminOnly, getFinanceData);

export default router;
