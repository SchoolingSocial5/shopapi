import { Router } from 'express';
import { getWholesaleProducts, getWholesaleProductById, createWholesaleProduct, updateWholesaleProduct, deleteWholesaleProduct } from '../controllers/wholesaleProductController';
import { protect, adminOnly } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/', getWholesaleProducts);
router.get('/:id', getWholesaleProductById);
router.post('/', protect, adminOnly, upload.single('image'), createWholesaleProduct);
router.post('/:id', protect, adminOnly, upload.single('image'), updateWholesaleProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateWholesaleProduct);
router.delete('/:id', protect, adminOnly, deleteWholesaleProduct);

export default router;
