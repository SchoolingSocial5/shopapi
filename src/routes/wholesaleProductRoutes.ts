import { Router } from 'express';
import { getWholesaleProducts, getWholesaleProductById, createWholesaleProduct, updateWholesaleProduct, deleteWholesaleProduct } from '../controllers/wholesaleProductController';
import { protect, adminOnly, wholesaleOnly } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/', getWholesaleProducts);
router.get('/:id', getWholesaleProductById);
router.post('/', protect, adminOnly, wholesaleOnly, upload.single('image'), createWholesaleProduct);
router.post('/:id', protect, adminOnly, wholesaleOnly, upload.single('image'), updateWholesaleProduct);
router.put('/:id', protect, adminOnly, wholesaleOnly, upload.single('image'), updateWholesaleProduct);
router.delete('/:id', protect, adminOnly, wholesaleOnly, deleteWholesaleProduct);

export default router;
