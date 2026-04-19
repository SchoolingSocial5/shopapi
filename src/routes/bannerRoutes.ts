import { Router } from 'express';
import { getBanners, createBanner, deleteBanner, updateBanner } from '../controllers/bannerController';
import { protect, adminOnly } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/', getBanners);
router.post('/', protect, adminOnly, upload.single('image'), createBanner);
router.patch('/:id', protect, adminOnly, upload.single('image'), updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

export default router;
