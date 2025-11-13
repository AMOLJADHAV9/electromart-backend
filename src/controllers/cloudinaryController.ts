import { Request, Response, RequestHandler } from 'express';
import { cloudinaryService } from '../services/cloudinary';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Controller for Cloudinary operations
export const cloudinaryController = {
  // Upload an image
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      // Check if file exists
      const file = req.file as Express.Multer.File;
      if (!file) {
        res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
        return;
      }

      // Get folder from request or use default
      const folder = (req.body.folder as string) || 'products';
      
      // Generate file name
      const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;

      // Upload to Cloudinary
      const result: any = await cloudinaryService.uploadImage(
        file.buffer, 
        fileName, 
        folder
      );

      res.status(201).json({ 
        success: true, 
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          original_name: file.originalname,
          size: file.size,
        }
      });
    } catch (error: any) {
      console.error('Error in uploadImage controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to upload image' 
      });
    }
  },

  // Delete an image
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;
      
      if (!publicId) {
        res.status(400).json({ 
          success: false, 
          message: 'Public ID is required' 
        });
        return;
      }

      const result = await cloudinaryService.deleteImage(publicId);
      
      res.json({ 
        success: true, 
        data: result,
        message: 'Image deleted successfully' 
      });
    } catch (error: any) {
      console.error('Error in deleteImage controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to delete image' 
      });
    }
  },

  // Get image details
  async getImageDetails(req: Request, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;
      
      if (!publicId) {
        res.status(400).json({ 
          success: false, 
          message: 'Public ID is required' 
        });
        return;
      }

      const details = await cloudinaryService.getImageDetails(publicId);
      
      res.json({ 
        success: true, 
        data: details
      });
    } catch (error: any) {
      console.error('Error in getImageDetails controller:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get image details' 
      });
    }
  },

  // Get multer upload middleware
  getUploadMiddleware(): RequestHandler {
    return upload.single('image') as unknown as RequestHandler;
  }
};