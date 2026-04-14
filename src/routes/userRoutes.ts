import { Router } from 'express';
import { getUsers, getStaff, getCustomers, getUserById, updateUserRole } from '../controllers/userController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, adminOnly, getUsers);
router.get('/staff', protect, adminOnly, getStaff);
router.get('/customers', protect, adminOnly, getCustomers);
router.get('/:id', protect, getUserById);
router.patch('/:id/role', protect, adminOnly, updateUserRole);
router.put('/:id/role', protect, adminOnly, updateUserRole);

export default router;
