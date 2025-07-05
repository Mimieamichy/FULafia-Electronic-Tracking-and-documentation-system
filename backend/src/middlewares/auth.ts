const JWT_SECRET = process.env.JWT_SECRET!;
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
    [key: string]: any;
  };
}

/**
 * Middleware to authenticate requests using JWT.
 * It checks for the presence of a Bearer token in the Authorization header,
 * verifies the token, and attaches the user information to the request object.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
      permissions?: string[];
      [key: string]: any;
    };

    // Ensure permissions is always present as an array
    const user = {
      ...decoded,
      permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
    };

    // Type assertion to add user property
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (err) {
    console.log('Token verification error:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return;
  }
}



