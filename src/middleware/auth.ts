import { Request, Response, NextFunction } from 'express';
import { firebaseService } from '../services/firebase';

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Validate that token exists
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid authorization token' 
      });
      return;
    }
    
    // Verify token with Firebase
    const decodedToken = await firebaseService.verifyIdToken(token);
    
    // Add user info to request
    (req as any).user = decodedToken;
    
    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Admin authorization middleware
export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // First check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    const user = (req as any).user;
    
    // Check if user has admin role
    // This would typically check a custom claim or a database field
    // For now, we'll check if the email ends with a specific domain
    if (!user.email || !user.email.endsWith('@electromart.com')) {
      res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
      return;
    }
    
    next();
  } catch (error: any) {
    console.error('Authorization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authorization check failed' 
    });
  }
};