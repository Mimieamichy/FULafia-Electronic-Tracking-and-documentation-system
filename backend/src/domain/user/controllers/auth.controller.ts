import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || '3600');

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
      success: true,
      data: {
        id: user._id,
        userId: user.matricNo,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token: '', 
      expiresIn: 0,
    });
    } catch (err: any) {
      res.status(err.status).json({
      success: false,
      error: err.message,
      message: err.message,
    });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      res.status(200).json({
      success: true,
      data: {
        id: user._id,
        userId: user.matricNo,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      expiresIn,
    });
    } catch (err: any) {
      res.status(err.status).json({
      success: false,
      error: err.message,
      message: err.message,
    });
    }
  }
}

