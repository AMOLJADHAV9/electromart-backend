import { Router, type Router as ExpressRouter } from 'express';
import { razorpayController } from '../controllers/razorpayController';

const router: ExpressRouter = Router();

// Routes for Razorpay operations
router.post('/create-order', razorpayController.createOrder);
router.post('/verify-payment', razorpayController.verifyPayment);
router.get('/order/:orderId', razorpayController.getOrderDetails);
router.get('/payment/:paymentId', razorpayController.getPaymentDetails);

export default router;