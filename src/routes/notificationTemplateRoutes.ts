import { Router } from 'express';
import { getNotificationTemplates, createNotificationTemplate, updateNotificationTemplate, deleteNotificationTemplate } from '../controllers/notificationTemplateController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, adminOnly, getNotificationTemplates);
router.post('/', protect, adminOnly, createNotificationTemplate);
router.put('/:id', protect, adminOnly, updateNotificationTemplate);
router.patch('/:id', protect, adminOnly, updateNotificationTemplate);
router.delete('/:id', protect, adminOnly, deleteNotificationTemplate);

export default router;
