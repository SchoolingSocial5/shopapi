import { Router } from 'express';
import { createOrder, getOrders, getCustomerOrders, getOrderById, updateOrderStatus, deleteOrder, bulkUpdateStatus, bulkDeleteOrders, getOrdersCount } from '../controllers/orderController';
import { protect, adminOnly, retailOnly } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// Public route for placing orders
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

// Public route for placing orders
router.post('/', upload.single('receipt'), async (req: any, res, next) => {
    // If user has an authorization header, try to silently attach the user
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
            try {
                const decoded = verifyToken(token);
                if (decoded) {
                    const user = await User.findById(decoded.id).select('-password');
                    if (user) {
                        req.user = user;
                    }
                }
            } catch (error) {
                console.warn('Silent authorization token verification failed, proceeding as guest checkout.');
            }
        }
    }
    next();
}, createOrder);

// Protected routes
router.get('/customer', protect, getCustomerOrders);
router.get('/', protect, adminOnly, retailOnly, getOrders);
router.get('/count', protect, adminOnly, retailOnly, getOrdersCount);
router.get('/:id', protect, retailOnly, getOrderById);
router.patch('/:id', protect, adminOnly, retailOnly, updateOrderStatus);
router.post('/bulk-status', protect, adminOnly, retailOnly, bulkUpdateStatus);
router.delete('/bulk-delete', protect, adminOnly, retailOnly, bulkDeleteOrders);
router.delete('/:id', protect, adminOnly, retailOnly, deleteOrder);

export default router;
