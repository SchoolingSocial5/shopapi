import { Router } from 'express';
import { getUsers, getStaff, getCustomers, getUserById, updateUserRole, deleteUser, getUserOrders, assignPosition, changePassword } from '../controllers/userController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, adminOnly, getUsers);
router.get('/staff', protect, adminOnly, getStaff);
router.get('/customers', protect, adminOnly, getCustomers);
router.patch('/profile/password', protect, changePassword);
router.get('/:id', protect, getUserById);
router.get('/:id/orders', protect, adminOnly, getUserOrders);
router.patch('/:id/assign-position', protect, adminOnly, assignPosition);
router.patch('/:id/role', protect, adminOnly, updateUserRole);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
