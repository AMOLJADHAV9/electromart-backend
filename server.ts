import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import firebaseRoutes from './src/routes/firebase';
import cloudinaryRoutes from './src/routes/cloudinary';
import razorpayRoutes from './src/routes/razorpay';

// Import config
import { serverConfig } from './src/config/index';

// Import services to check configuration
import { firebaseService } from './src/services/firebase';
import { cloudinaryService } from './src/services/cloudinary';
import { razorpayService } from './src/services/razorpay';

// Create Express app
const app: Application = express();
const port = serverConfig.port;

// 🚀 CORS — ALLOW EVERYTHING, NO RESTRICTIONS
app.use(cors({ 
  origin: "*", 
  methods: "*",
  allowedHeaders: "*"
}));

// OPTIONAL but recommended — handle OPTIONS globally
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/firebase', firebaseRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/payment', razorpayRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for orders
app.get('/api/test-orders', (req: Request, res: Response) => {
  const mockOrders = [ /* ... unchanged ... */ ];
  res.json({ success: true, data: mockOrders });
});

// Simple test endpoint for Firebase collections
app.get('/api/firebase/test', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Firebase route is working',
    isFirebaseConfigured: firebaseService.isConfigured(),
    data: []
  });
});

// Serve static files in production
if (serverConfig.nodeEnv === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // React router fallback
  app.get('/[^.]*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);

  console.log('\n=== Service Configurations ===');
  console.log('Firebase configured:', firebaseService.isConfigured());
  console.log('Cloudinary configured:', cloudinaryService.isConfigured());
  console.log('Razorpay configured:', razorpayService.isConfigured());
});

export default app;
