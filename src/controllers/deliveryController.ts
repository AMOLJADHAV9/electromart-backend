import { Request, Response } from 'express';
import { deliveryService } from '../services/delivery';
import { StatusUpdateRequest } from '../models/order';

// Controller for Delivery operations
export const deliveryController = {
  // Register a new delivery boy
  async registerDeliveryBoy(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, vehicleType } = req.body;
      
      // Validate required fields
      if (!name || !email || !phone || !vehicleType) {
        res.status(400).json({
          success: false,
          message: 'Name, email, phone, and vehicleType are required'
        });
        return;
      }
      
      // In a real implementation, we would create a Firebase user and get the UID
      // For now, we'll simulate this with a placeholder
      const deliveryBoyData = {
        uid: `delivery_${Date.now()}`, // Placeholder UID
        name,
        email,
        phone,
        vehicleType
      };
      
      const result = await deliveryService.registerDeliveryBoy(deliveryBoyData);
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error in registerDeliveryBoy controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  // Get all orders assigned to the delivery boy
  async getAssignedOrders(req: Request, res: Response): Promise<void> {
    try {
      // Get delivery boy ID from authenticated user
      const deliveryBoyId = (req as any).user?.uid;
      
      if (!deliveryBoyId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: Delivery boy ID not found'
        });
        return;
      }
      
      // Get status filter from query params
      const status = req.query.status as string | undefined;
      
      const result = await deliveryService.getAssignedOrders(deliveryBoyId, status);
      
      res.json(result);
    } catch (error: any) {
      console.error('Error in getAssignedOrders controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  // Get order details by ID
  async getOrderDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id: orderId } = req.params;
      
      // Validate required parameters
      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
        return;
      }
      
      // Get delivery boy ID from authenticated user
      const deliveryBoyId = (req as any).user?.uid;
      
      if (!deliveryBoyId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: Delivery boy ID not found'
        });
        return;
      }
      
      const result = await deliveryService.getOrderDetails(orderId, deliveryBoyId);
      
      res.json(result);
    } catch (error: any) {
      console.error('Error in getOrderDetails controller:', error);
      
      if (error.message === 'Order not found') {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }
      
      if (error.message === 'Unauthorized: Order not assigned to this delivery boy') {
        res.status(403).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  // Update order status
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: orderId } = req.params;
      const statusUpdate: StatusUpdateRequest = req.body;
      
      // Validate required parameters
      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
        return;
      }
      
      if (!statusUpdate.status) {
        res.status(400).json({
          success: false,
          message: 'Status is required'
        });
        return;
      }
      
      // Get delivery boy ID from authenticated user
      const deliveryBoyId = (req as any).user?.uid;
      
      if (!deliveryBoyId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: Delivery boy ID not found'
        });
        return;
      }
      
      const result = await deliveryService.updateOrderStatus(orderId, statusUpdate, deliveryBoyId);
      
      res.json(result);
    } catch (error: any) {
      console.error('Error in updateOrderStatus controller:', error);
      
      if (error.message === 'Unauthorized: Order not assigned to this delivery boy') {
        res.status(403).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
};