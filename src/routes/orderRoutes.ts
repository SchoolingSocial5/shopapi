import { Router } from 'express';
import { createOrder, getOrders, getCustomerOrders, getOrderById, updateOrderStatus, deleteOrder, bulkUpdateStatus, bulkDeleteOrders } from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

// Public route for placing orders
router.post('/', upload.single('receipt'), (req, res, next) => {
    // If user is logged in, attach user id, otherwise proceed as guest
    if (req.headers.authorization) {
        protect(req as any, res, next);
    } else {
        next();
    }
}, createOrder);

// Protected routes
router.get('/customer', protect, getCustomerOrders);
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id', protect, adminOnly, updateOrderStatus);
router.post('/bulk-status', protect, adminOnly, bulkUpdateStatus);
router.delete('/bulk-delete', protect, adminOnly, bulkDeleteOrders);
router.delete('/:id', protect, adminOnly, deleteOrder);

export default router;
