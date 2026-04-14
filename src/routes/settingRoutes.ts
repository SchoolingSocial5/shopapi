import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController';
import { protect, adminOnly } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/', getSettings);
router.post('/', protect, adminOnly, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), updateSettings);

export default router;
