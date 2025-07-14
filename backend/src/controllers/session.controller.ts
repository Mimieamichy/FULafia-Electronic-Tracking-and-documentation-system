// src/services/AdminService.ts
import { Request, Response } from 'express';
import ActivityLogService from '../../src/services/activity_log'
import SessionService from '../../src/services/session'



export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
    [key: string]: any;
  };
}


export default class SessionController {

  static async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = await SessionService.getAllSessions();
      res.json({ success: true, data: sessions });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to get all sessions', message: err.message });
    }
  }

 static async createSession(req: AuthenticatedRequest, res: Response) {
  try {
    const { sessionName, startDate, endDate } = req.body;

    // Assuming req.user contains the authenticated user's ID
    const userId = req.user?._id;

    const sessionData = {
      sessionName,
      startDate,
      endDate,
      userId,
    };

    const session = await SessionService.createSession(sessionData);

    res.json({ success: true, data: session });
  } catch (err: any) {
    console.log(err)
    res.status(400).json({success: false, error: "Failed to create session", message: err.message});
  }
}

static async getSessionByDepartment(req: AuthenticatedRequest, res: Response){
  try {
    const userId = req.user?._id;
    const department = await SessionService.getSessionByDepartment(userId);
    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
  } catch(err: any) {
    console.log(err)
    res.status(400).json({success: false, error: "Failed to get department session", message: err.message});
  }

}
static async getSessionByFaculty(req: AuthenticatedRequest, res: Response){
  try {
    const userId = req.user?._id;
    const department = await SessionService.getSessionByFaculty(userId);
    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
  } catch(err: any) {
    console.log(err)
    res.status(400).json({success: false, error: "Failed to get department session", message: err.message});
  }

}

  
}
