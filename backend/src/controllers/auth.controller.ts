// src/controllers/base/AuthController.ts
import { Request, Response } from 'express';
import AuthService from '../../src/services/auth';


export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
    permissions: string[];
    [key: string]: any;
  };
}

export default class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      res.json({ success: true, data: { user, token } });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'invalid_credentials', message: err.message });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    await AuthService.logout(req.user?._id);
    res.json({ success: true, message: 'Logged out successfully' });
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'invalid_request', message: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.json({ success: true, message: 'Password has been reset' });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'invalid_token', message: err.message });
    }
  }



   
}
