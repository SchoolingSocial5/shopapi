import { Router } from 'express';
import { getPositions, createPosition, updatePosition, deletePosition } from '../controllers/positionController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, adminOnly, getPositions);
router.post('/', protect, adminOnly, createPosition);
router.patch('/:id', protect, adminOnly, updatePosition);
router.delete('/:id', protect, adminOnly, deletePosition);

export default router;
