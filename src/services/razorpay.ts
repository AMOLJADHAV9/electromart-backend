import Razorpay from 'razorpay';
import crypto from 'crypto';
import { razorpayConfig } from '../config/index';

const isDebug = process.env.NODE_ENV !== 'production';
const debugLog = (...args: any[]) => {
  if (isDebug) {
    console.log('[Razorpay]', ...args);
  }
};

// Initialize Razorpay instance only if credentials are provided and not placeholders
let razorpay: Razorpay | null = null;
let isConfigured = false;

// Check if we have the required credentials and they're not placeholders
const hasValidCredentials = razorpayConfig.keyId && 
    razorpayConfig.keySecret && 
    !razorpayConfig.keyId.includes('XXXXXXXX') && 
    !razorpayConfig.keySecret.includes('XXXXXXXX') &&
    razorpayConfig.keyId !== 'rzp_test_abcdefghijklmnopqrstuvwxyz' &&
    razorpayConfig.keySecret !== 'abcdefghijklmnopqrstuvwxyz1234567890abcd';

if (hasValidCredentials) {
  try {
    razorpay = new Razorpay({
      key_id: razorpayConfig.keyId,
      key_secret: razorpayConfig.keySecret,
    });
    isConfigured = true;
    debugLog('Configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure Razorpay:', error);
    console.warn('⚠️  Payment functionality will be disabled');
  }
} else {
  console.warn('⚠️  Razorpay credentials not configured or using placeholder values. Payment functionality will be disabled.');
}

// Helper function to check if Razorpay is configured
const isRazorpayConfigured = (): boolean => {
  return isConfigured && razorpay !== null;
};

// Razorpay service functions
export const razorpayService = {
  // Create a new order
  async createOrder(amount: number, currency: string = 'INR', receipt?: string) {
    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      throw new Error('Razorpay is not configured. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
    }

    try {
      debugLog('Creating order', { amount, currency, receipt });

      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount. Amount must be greater than zero.');
      }

      // Ensure amount is in the smallest currency unit (paise for INR)
      const amountInPaise = Math.round(amount);
      debugLog('Amount in paise', amountInPaise);

      const orderOptions = {
        amount: amountInPaise,
        currency,
        receipt: receipt || `receipt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      };

      debugLog('Order options', orderOptions);

      // Try direct async/await first (newer SDK versions support this)
      let order;
      try {
        order = await razorpay!.orders.create(orderOptions);
      } catch (error) {
        // If direct async/await fails, fallback to callback approach
        order = await new Promise((resolve, reject) => {
          razorpay!.orders.create(orderOptions, (err: any, order: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(order);
            }
          });
        });
      }
      
      debugLog('Order created', order);
      
      // Check if order has the expected structure
      if (!order || typeof order !== 'object') {
        throw new Error('Invalid response from Razorpay API');
      }
      
      debugLog('Order keys', Object.keys(order));
      
      return {
        success: true,
        orderId: (order as any).id || (order as any).order_id || null,
        amount: (order as any).amount,
        currency: (order as any).currency,
        receipt: (order as any).receipt,
        status: (order as any).status,
        created_at: (order as any).created_at,
      };
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      
      // Handle specific Razorpay errors
      if (error.statusCode) {
        throw new Error(`Razorpay API Error: ${error.error?.description || error.message}`);
      }
      
      throw new Error(`Failed to create order: ${error.message}`);
    }
  },

  // Verify payment signature
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      throw new Error('Razorpay is not configured. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
    }

    try {
      debugLog('Verifying payment signature', { orderId, paymentId });

      // Create the expected signature
      const generatedSignature = crypto
        .createHmac('sha256', razorpayConfig.keySecret)
        .update(orderId + '|' + paymentId)
        .digest('hex');

      debugLog('Generated signature', generatedSignature);

      // Use timingSafeEqual to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );

      debugLog('Signature valid', isValid);

      return isValid;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      throw new Error('Payment verification failed');
    }
  },

  // Fetch order details
  async fetchOrder(orderId: string) {
    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      throw new Error('Razorpay is not configured. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
    }

    try {
      const order = await razorpay!.orders.fetch(orderId);
      return {
        success: true,
        order,
      };
    } catch (error: any) {
      console.error('Error fetching Razorpay order:', error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  },

  // Fetch payment details
  async fetchPayment(paymentId: string) {
    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      throw new Error('Razorpay is not configured. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
    }

    try {
      const payment = await razorpay!.payments.fetch(paymentId);
      return {
        success: true,
        payment,
      };
    } catch (error: any) {
      console.error('Error fetching Razorpay payment:', error);
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  },

  // Refund a payment
  async refundPayment(paymentId: string, amount?: number, notes?: Record<string, string>) {
    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      throw new Error('Razorpay is not configured. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
    }

    try {
      const refundOptions: any = {
        payment_id: paymentId,
      };

      if (amount) {
        refundOptions.amount = amount;
      }

      if (notes) {
        refundOptions.notes = notes;
      }

      // For refund, we need to pass the payment_id as first parameter and options as second
      // Try direct async/await first (newer SDK versions support this)
      let refund;
      try {
        refund = await razorpay!.payments.refund(paymentId, refundOptions);
      } catch (error) {
        // If direct async/await fails, fallback to callback approach
        refund = await new Promise((resolve, reject) => {
          razorpay!.payments.refund(paymentId, refundOptions, (err: any, refund: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(refund);
            }
          });
        });
      }
      
      return {
        success: true,
        refund,
      };
    } catch (error: any) {
      console.error('Error refunding Razorpay payment:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  },

  // Check if Razorpay is configured
  isConfigured: isRazorpayConfigured,
};