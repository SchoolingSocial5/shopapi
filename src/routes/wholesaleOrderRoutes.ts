import { Router } from 'express';
import * as wholesaleOrderController from '../controllers/wholesaleOrderController';
import { protect, authorize } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Admin routes
router.get('/', protect, wholesaleOrderController.getOrders);
router.get('/:id', protect, wholesaleOrderController.getOrderById);
router.patch('/:id', protect, wholesaleOrderController.updateOrderStatus);
router.delete('/:id', protect, authorize('Director'), wholesaleOrderController.deleteOrder);
router.post('/bulk-status', protect, wholesaleOrderController.bulkUpdateStatus);
router.delete('/bulk-delete', protect, authorize('Director'), wholesaleOrderController.bulkDeleteOrders);

// Create order (can be used by admin/staff)
router.post('/', protect, upload.single('receipt'), wholesaleOrderController.createOrder);

export default router;
