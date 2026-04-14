import { Router } from 'express';
import { getPurchases, createPurchase, deletePurchase } from '../controllers/purchaseController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, adminOnly, getPurchases);
router.post('/', protect, adminOnly, createPurchase);
router.delete('/:id', protect, adminOnly, deletePurchase);

export default router;
