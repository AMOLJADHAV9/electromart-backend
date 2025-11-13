import { Router, type Router as ExpressRouter } from 'express';
import { firebaseController } from '../controllers/firebaseController';

const router: ExpressRouter = Router();

// Routes for Firebase operations
router.get('/:collectionName/:docId', firebaseController.getDocument);
router.get('/:collectionName', firebaseController.getCollection);
router.post('/:collectionName', firebaseController.addDocument);
router.put('/:collectionName/:docId', firebaseController.updateDocument);
router.delete('/:collectionName/:docId', firebaseController.deleteDocument);

export default router;