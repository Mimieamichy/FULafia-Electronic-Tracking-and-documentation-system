import { Request, Response } from "express";
import NotificationService from "../services/notification"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
    permissions: string[];
    [key: string]: any;
  }
}

export default class NotificationController {
  static viewNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
     
    const userId = req.user?.id || ''

      const notifications = await NotificationService.getNotifications(userId); 
      res.json({ success: true, data: notifications });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get notification text', message: err.message });
    }
  };

  static updateReadReciept = async (req: AuthenticatedRequest, res: Response) => {
    try {
     
    const userId = req.user?.id || ''
    const {id} = req.params

      const notifications = await NotificationService.updateReadReciept(userId, id); 
      res.json({ success: true, data: notifications });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to update read reciept', message: err.message });
    }
  };
}
