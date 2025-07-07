// src/controllers/base/AuthController.ts
import { Request, Response } from 'express';
import AuthService from '../../services/auth';
import UserService from '../../services/user';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
    [key: string]: any;
  };
}

export default class GeneralController {
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
      res.status(400).json({ success: false, error: 'invalid_request', message: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.json({ success: true, message: 'Password has been reset' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'invalid_token', message: err.message });
    }
  }

  static async viewNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const notes = await AuthService.getNotifications(req.user?._id);
      res.json({ success: true, data: notes });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get notification text', message: err.message });
    }
  }

   static async getUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await UserService.getUserProfile(req.user?._id);
      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get User profile', message: err.message });
    }
  }

   static async updatePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const {oldPassword, newPassword} = req.body;
      await UserService.updatePassword(req.user?._id, oldPassword, newPassword);
      res.json({ success: true, data: newPassword });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get update password', message: err.message });
    }
  }
}
