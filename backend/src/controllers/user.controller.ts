import UserService from '../services/user';
import ActivityLogService from '../services/activity_log'
import { Request, Response } from 'express';
import Lecturer from '../models/lecturer';


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
      const { oldPassword, newPassword } = req.body;
      const userId = req.user?.id || ""
      await UserService.updatePassword(userId, oldPassword, newPassword);
      res.json({ success: true, data: newPassword });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to get update password', message: err.message });
    }
  }

  static async getAllLogs(req: AuthenticatedRequest, res: Response) {
    try {
      let logs;
      if (req.user?.roles?.includes("provost")) {
        logs = await ActivityLogService.getAllLogs();
      } else if (req.user?.roles?.includes("hod")) {
        const lecturer = await Lecturer.findOne({ user: req.user?.id }).select("department");
        if (!lecturer?.department) {
          res.status(400).json({ success: false, error: "No department found for this HOD" });
          return
        }
        logs = await ActivityLogService.getLogsForHOD(lecturer.department);
      } else {
        res.status(403).json({ success: false, error: "Unauthorized" });
        return
      }
      res.json({ success: true, data: logs });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to get Actibity Logs', message: err.message });
    }
  }

}
