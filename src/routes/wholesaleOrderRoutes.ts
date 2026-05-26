import { Router } from 'express';
import * as wholesaleOrderController from '../controllers/wholesaleOrderController';
import { protect, authorize, adminOnly, wholesaleOnly } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Admin routes
router.get('/', protect, adminOnly, wholesaleOnly, wholesaleOrderController.getOrders);
router.get('/:id', protect, adminOnly, wholesaleOnly, wholesaleOrderController.getOrderById);
router.patch('/:id', protect, adminOnly, wholesaleOnly, wholesaleOrderController.updateOrderStatus);
router.delete('/:id', protect, adminOnly, wholesaleOnly, authorize('Director'), wholesaleOrderController.deleteOrder);
router.post('/bulk-status', protect, adminOnly, wholesaleOnly, wholesaleOrderController.bulkUpdateStatus);
router.delete('/bulk-delete', protect, adminOnly, wholesaleOnly, authorize('Director'), wholesaleOrderController.bulkDeleteOrders);
router.post('/bulk-restore', protect, adminOnly, wholesaleOnly, authorize('Director'), wholesaleOrderController.bulkRestoreOrders);
router.post('/:id/restore', protect, adminOnly, wholesaleOnly, authorize('Director'), wholesaleOrderController.restoreOrder);

import { verifyToken } from '../utils/jwt';
import User from '../models/User';

// Create order (can be used by admin/staff/customer)
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
}, wholesaleOrderController.createOrder);

export default router;
