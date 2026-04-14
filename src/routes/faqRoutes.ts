import { Router } from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faqController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getFaqs);
router.post('/', protect, adminOnly, createFaq);
router.post('/:id', protect, adminOnly, updateFaq);
router.put('/:id', protect, adminOnly, updateFaq);
router.delete('/:id', protect, adminOnly, deleteFaq);

export default router;
