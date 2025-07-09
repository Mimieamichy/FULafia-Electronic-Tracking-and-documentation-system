import UserService from '../../src/services/user';
import { Request, Response } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
    [key: string]: any;
  };
}


export default class UserController {
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