import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, adminOnly, getAnalytics);

export default router;
