import { firebaseService } from './firebase';
import { DeliveryBoy, DeliveryOrder, StatusUpdateRequest } from '../models/order';

// Delivery service functions
export const deliveryService = {
  // Register a new delivery boy
  async registerDeliveryBoy(deliveryBoyData: Omit<DeliveryBoy, 'createdAt' | 'role'>) {
    try {
      const deliveryBoyWithDefaults: DeliveryBoy = {
        ...deliveryBoyData,
        role: "delivery",
        createdAt: new Date()
      };
      
      // Add delivery boy to users collection
      const result = await firebaseService.addDocument('users', deliveryBoyWithDefaults);
      
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      console.error('Error registering delivery boy:', error);
      throw new Error(error.message || 'Failed to register delivery boy');
    }
  },

  // Get orders assigned to a delivery boy
  async getAssignedOrders(deliveryBoyId: string, status?: string) {
    try {
      // Check if Firebase is initialized
      if (!firebaseService.isConfigured()) {
        throw new Error('Firestore is not available. Firebase is not properly configured.');
      }

      // Get Firestore instance
      const db = (firebaseService as any).db;
      
      let query = db.collection('orders').where('assignedDeliveryBoyId', '==', deliveryBoyId);
      
      // Filter by status if provided
      if (status) {
        query = query.where('orderStatus', '==', status.toUpperCase());
      }
      
      const snapshot = await query.get();
      const orders = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      
      return {
        success: true,
        data: orders
      };
    } catch (error: any) {
      console.error('Error fetching assigned orders:', error);
      throw new Error(error.message || 'Failed to fetch assigned orders');
    }
  },

  // Get order details by ID
  async getOrderDetails(orderId: string, deliveryBoyId: string) {
    try {
      const order: any = await firebaseService.getDocument('orders', orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if delivery boy has access to this order
      if (order.assignedDeliveryBoyId !== deliveryBoyId) {
        throw new Error('Unauthorized: Order not assigned to this delivery boy');
      }
      
      return {
        success: true,
        data: order
      };
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      throw new Error(error.message || 'Failed to fetch order details');
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, statusUpdate: StatusUpdateRequest, deliveryBoyId: string) {
    try {
      // First, get the order to verify it exists and is assigned to this delivery boy
      const orderResult = await this.getOrderDetails(orderId, deliveryBoyId);
      const order: any = orderResult.data;
      
      // Validate status transition (simplified for delivery boy)
      const validTransitions = ['shipped', 'out_for_delivery', 'delivered'];
      const newStatus = statusUpdate.status.toUpperCase();
      
      if (!validTransitions.includes(statusUpdate.status)) {
        throw new Error('Invalid status update');
      }
      
      // Prevent downgrades in status
      const statusOrder = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
      const currentStatusIndex = statusOrder.indexOf(order.orderStatus);
      const newStatusIndex = statusOrder.indexOf(newStatus);
      
      if (newStatusIndex < currentStatusIndex) {
        throw new Error('Cannot downgrade order status');
      }
      
      // Update the order status
      const updatedOrder = await firebaseService.updateDocument('orders', orderId, {
        orderStatus: newStatus,
        updatedAt: new Date()
      });
      
      // Add to status timeline
      const statusTimelineEntry = {
        status: newStatus,
        timestamp: new Date(),
        description: `Order status updated to ${statusUpdate.status}`
      };
      
      // Update the status timeline
      const existingTimeline = order.statusTimeline || [];
      const updatedTimeline = [...existingTimeline, statusTimelineEntry];
      
      await firebaseService.updateDocument('orders', orderId, {
        statusTimeline: updatedTimeline
      });
      
      return {
        success: true,
        data: { ...updatedOrder, orderStatus: newStatus },
        message: 'Order status updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw new Error(error.message || 'Failed to update order status');
    }
  }
};