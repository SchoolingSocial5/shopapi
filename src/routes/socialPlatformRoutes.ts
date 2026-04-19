import { Router } from 'express';
import { getSocialPlatforms, createSocialPlatform } from '../controllers/socialPlatformController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getSocialPlatforms);
router.post('/', protect, adminOnly, createSocialPlatform);

export default router;
