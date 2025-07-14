import UserService from '../../src/services/user';
import ActivityLogService from '../../src/services/activity_log'
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
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to get User profile', message: err.message });
    }
  }

   static async updatePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const {oldPassword, newPassword} = req.body;
      const userId = req.user?.id || ""
      await UserService.updatePassword(userId, oldPassword, newPassword);
      res.json({ success: true, data: newPassword });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to get update password', message: err.message });
    }
  }

  static async getActivityLogs(req: Request, res: Response) {
    try {
      const logs = await ActivityLogService.getHistory(100);
      res.json({ success: true, data: logs });
    } catch (err: any) {
      console.log(err)
      res.status(500).json({ success: false, error: 'Failed to get all activities', message: err.message });
    }
  }
}
