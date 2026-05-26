import { Router } from 'express';
import { getEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '../controllers/emailTemplateController';
import { protect, adminOnly } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/', protect, adminOnly, getEmailTemplates);
router.post('/', protect, adminOnly, upload.single('banner'), createEmailTemplate);
router.put('/:id', protect, adminOnly, upload.single('banner'), updateEmailTemplate);
router.patch('/:id', protect, adminOnly, upload.single('banner'), updateEmailTemplate);
router.delete('/:id', protect, adminOnly, deleteEmailTemplate);

export default router;
