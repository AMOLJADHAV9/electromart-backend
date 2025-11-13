import { Request, Response } from 'express';
import { razorpayService } from '../services/razorpay';

const isDebug = process.env.NODE_ENV !== 'production';
const debugLog = (...args: any[]) => {
  if (isDebug) {
    console.log('[RazorpayController]', ...args);
  }
};

// Controller for Razorpay operations
export const razorpayController = {
  // Create a new order
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency, receipt } = req.body;
      
      // Debug logging
      debugLog('Order creation request received', { amount, currency, receipt });
      
      // Validate required fields
      if (!amount) {
        debugLog('Amount is missing or invalid');
        res.status(400).json({ 
          success: false, 
          message: 'Amount is required' 
        });
        return;
      }

      const order = await razorpayService.createOrder(amount, currency, receipt);
      
      debugLog('Order created successfully', order);
      
      res.status(201).json({ 
        success: true, 
        data: order 
      });
    } catch (error: any) {
      console.error('Error in createOrder controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to create order' 
      });
    }
  },

  // Verify payment
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      // Debug logging
      debugLog('Payment verification request received', {
        razorpay_order_id,
        razorpay_payment_id,
      });
      
      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        debugLog('Missing required fields for payment verification');
        res.status(400).json({ 
          success: false, 
          message: 'Missing required payment verification fields',
          received: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
          }
        });
        return;
      }

      const isValid = razorpayService.verifyPaymentSignature(
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature
      );
      
      if (isValid) {
        res.json({ 
          success: true, 
          message: 'Payment verified successfully' 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid payment signature' 
        });
      }
    } catch (error: any) {
      console.error('Error in verifyPayment controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to verify payment' 
      });
    }
  },

  // Get order details
  async getOrderDetails(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        res.status(400).json({ 
          success: false, 
          message: 'Order ID is required' 
        });
        return;
      }

      const order = await razorpayService.fetchOrder(orderId);
      
      res.json({ 
        success: true, 
        data: order 
      });
    } catch (error: any) {
      console.error('Error in getOrderDetails controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch order details' 
      });
    }
  },

  // Get payment details
  async getPaymentDetails(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        res.status(400).json({ 
          success: false, 
          message: 'Payment ID is required' 
        });
        return;
      }

      const payment = await razorpayService.fetchPayment(paymentId);
      
      res.json({ 
        success: true, 
        data: payment 
      });
    } catch (error: any) {
      console.error('Error in getPaymentDetails controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch payment details' 
      });
    }
  },
};