import { Router, type Router as ExpressRouter } from 'express';
import { cloudinaryController } from '../controllers/cloudinaryController';

const router: ExpressRouter = Router();

// Routes for Cloudinary operations
router.post('/upload', cloudinaryController.getUploadMiddleware(), cloudinaryController.uploadImage);
router.delete('/delete/:publicId', cloudinaryController.deleteImage);
router.get('/details/:publicId', cloudinaryController.getImageDetails);

export default router;