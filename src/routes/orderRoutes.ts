import { Router } from 'express';
import { createOrder, getOrders, getCustomerOrders, getOrderById, updateOrderStatus, deleteOrder } from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Public route for placing orders
router.post('/', (req, res, next) => {
    // If user is logged in, attach user id, otherwise proceed as guest
    if (req.headers.authorization) {
        return protect(req as any, res, next);
    }
    next();
}, createOrder);

// Protected routes
router.get('/customer', protect, getCustomerOrders);
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

export default router;
