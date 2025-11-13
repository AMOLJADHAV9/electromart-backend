import { Request, Response } from 'express';
import { firebaseService } from '../services/firebase';

// Controller for Firebase operations
export const firebaseController = {
  // Get a document by ID
  async getDocument(req: Request, res: Response): Promise<void> {
    try {
      const { collectionName, docId } = req.params;
      
      // Validate required parameters
      if (!collectionName || !docId) {
        res.status(400).json({ 
          success: false, 
          message: 'Collection name and document ID are required' 
        });
        return;
      }
      
      const document = await firebaseService.getDocument(collectionName, docId);
      
      if (!document) {
        res.status(404).json({ 
          success: false, 
          message: 'Document not found' 
        });
        return;
      }
        
      res.json({ 
        success: true, 
        data: document 
      });
    } catch (error: any) {
      console.error('Error in getDocument controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Internal server error' 
      });
    }
  },

  // Get all documents in a collection
  async getCollection(req: Request, res: Response): Promise<void> {
    try {
      const { collectionName } = req.params;
      const { userId } = req.query;
      
      // Validate required parameters
      if (!collectionName) {
        res.status(400).json({ 
          success: false, 
          message: 'Collection name is required' 
        });
        return;
      }
      
      let documents;
      if (userId && typeof userId === 'string') {
        // If userId is provided, filter documents by userId
        documents = await firebaseService.getCollectionByUserId(collectionName, userId);
      } else {
        // Otherwise, get all documents
        documents = await firebaseService.getCollection(collectionName);
      }
      
      res.json({ 
        success: true, 
        data: documents 
      });
    } catch (error: any) {
      console.error('Error in getCollection controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Internal server error' 
      });
    }
  },

  // Add a new document to a collection
  async addDocument(req: Request, res: Response): Promise<void> {
    try {
      const { collectionName } = req.params;
      
      // Validate required parameters
      if (!collectionName) {
        res.status(400).json({ 
          success: false, 
          message: 'Collection name is required' 
        });
        return;
      }
      
      const data = req.body;
      
      const document = await firebaseService.addDocument(collectionName, data);
      
      res.status(201).json({ 
        success: true, 
        data: document 
      });
    } catch (error: any) {
      console.error('Error in addDocument controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Internal server error' 
      });
    }
  },

  // Update a document
  async updateDocument(req: Request, res: Response): Promise<void> {
    try {
      const { collectionName, docId } = req.params;
      
      // Validate required parameters
      if (!collectionName || !docId) {
        res.status(400).json({ 
          success: false, 
          message: 'Collection name and document ID are required' 
        });
        return;
      }
      
      const data = req.body;
      
      const document = await firebaseService.updateDocument(collectionName, docId, data);
      
      res.json({ 
        success: true, 
        data: document 
      });
    } catch (error: any) {
      console.error('Error in updateDocument controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Internal server error' 
      });
    }
  },

  // Delete a document
  async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { collectionName, docId } = req.params;
      
      // Validate required parameters
      if (!collectionName || !docId) {
        res.status(400).json({ 
          success: false, 
          message: 'Collection name and document ID are required' 
        });
        return;
      }
      
      await firebaseService.deleteDocument(collectionName, docId);
      
      res.json({ 
        success: true, 
        message: 'Document deleted successfully' 
      });
    } catch (error: any) {
      console.error('Error in deleteDocument controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Internal server error' 
      });
    }
  },
};