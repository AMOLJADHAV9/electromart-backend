// Order model interface
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderStatusTimeline {
  status: 'ORDER_PLACED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  timestamp: Date;
  description?: string;
}

export interface Order {
  id?: string;
  userId: string;
  products: OrderItem[];
  totalAmount: number;
  shippingCharges: number;
  taxAmount: number;
  paymentId: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  deliveryAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderStatus: 'ORDER_PLACED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  statusTimeline: OrderStatusTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

// Order creation request interface
export interface CreateOrderRequest {
  userId: string;
  products: OrderItem[];
  totalAmount: number;
  shippingCharges: number;
  taxAmount: number;
  paymentId: string;
  deliveryAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// Order response interface
export interface OrderResponse {
  success: boolean;
  data?: Order;
  message?: string;
  error?: string;
}