import { Request, Response } from "express";
import NotificationService from "../services/notification"

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
    [key: string]: any;
  }
}

export default class NotificationController {
  static viewNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
     
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'User ID is missing from request.' });
        return
      }

      const notifications = await NotificationService.getNotifications(req.user.id); 
      res.json({ success: true, data: notifications });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get notification text', message: err.message });
    }
  };
}
