import UserService from '../services/user';
import ActivityLogService from '../services/activity_log'
import { Request, Response } from 'express';


export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
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
      const userFirstName = `${req.user?.title || ''} ${req.user?.firstName || ''}`;
      const userLastName = req.user?.lastName || '';
      await UserService.updatePassword(userId, oldPassword, newPassword);
      await ActivityLogService.logActivity(userId, userFirstName, userLastName, 'updated', 'their password');
      res.json({ success: true, data: newPassword });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to get update password', message: err.message });
    }
  }

     static async getAllLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await ActivityLogService.getAllLogs();
      res.json({ success: true, data: logs });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to get Actibity Logs', message: err.message });
    }
  }

}
