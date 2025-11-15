import { Router, type Router as ExpressRouter } from 'express';
import { deliveryController } from '../controllers/deliveryController';
import { authenticate } from '../middleware/auth';

const router: ExpressRouter = Router();

// Public routes
router.post('/auth/register', deliveryController.registerDeliveryBoy);

// Protected routes (require authentication)
router.get('/orders', authenticate, deliveryController.getAssignedOrders);
router.get('/order/:id', authenticate, deliveryController.getOrderDetails);
router.put('/order/:id/status', authenticate, deliveryController.updateOrderStatus);

export default router;