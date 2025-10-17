// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
        [key: string]: any;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      res.status(500).json({
        error: 'Server configuration error'
      });
      return;
    }

    // Verify token with the same secret as Django backend
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    // Extract user info from token payload
    // Adjust these fields based on your Django JWT structure
    req.user = {
      id: decoded.user_id || decoded.userId || decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role,
      ...decoded
    };

    next();
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
      return;
    }
    
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication failed'
      });
      return;
    }

    console.error('Auth middleware error:', err);
    res.status(500).json({
      error: 'Authentication error'
    });
  }
};

// Optional: Middleware to check if user owns the resource
export const checkOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = req.params[resourceIdParam];
      
      // You can add logic here to check if req.user.id matches the resource owner
      // For now, we'll pass this through and handle it in controllers
      next();
    } catch (err: unknown) {
      console.error('Ownership check error:', err);
      res.status(500).json({
        error: 'Authorization check failed'
      });
    }
  };
};
