import { Request, Response } from 'express';
import DefenceService from '../services/defence';
import ActivityLogService from '../services/activity_log';


export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
    permissions: string[];
    [key: string]: any;
  };
}
export default class DefenceController {
  static async getAllDefences(req: Request, res: Response) {
    try {
      const defences = await DefenceService.getAllDefenses();
      res.json({ success: true, data: defences });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get all defences', message: err.message });
    }
  }

  /** Schedule a new defence */
  static async scheduleDefence(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || '';
      const userFirstName = `${req.user?.title || ''} ${req.user?.firstName || ''}`;
      const userLastName = req.user?.lastName || '';
      const defence = await DefenceService.scheduleDefence(req.body);
      await ActivityLogService.logActivity(userId, userFirstName, userLastName, "Scheduled", "Defence");
      res.json({ success: true, data: defence });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to schedule defence', message: err.message });
    }
  }

  /** Start a defence */
  static async startDefence(req: AuthenticatedRequest, res: Response) {
    try {
      const { defenceId } = req.params;
      const userId = req.user?.id || '';
      const userFirstName = `${req.user?.title || ''} ${req.user?.firstName || ''}`;
      const userLastName = req.user?.lastName || '';
      const defence = await DefenceService.startDefence(defenceId);
      await ActivityLogService.logActivity(userId, userFirstName, userLastName, "Started", "Defence");
      res.json({ success: true, data: defence });
    } catch (err: any) {
      res
        .status(400)
        .json({
          success: false,
          error: 'Failed to start defence',
          message: err.message,
        });
    }
  }

  /** Submit score for a student by a panel member */
  static async submitScore(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId, panelMemberId, scores } = req.body;
      const { defenceId } = req.params;
      const userId = req.user?.id || '';
            const userFirstName = `${req.user?.title || ''} ${req.user?.firstName || ''}`;
            const userLastName = req.user?.lastName || '';
      const sheet = await DefenceService.submitScore(
        defenceId,
        panelMemberId,
        studentId,
        scores
      );
      await ActivityLogService.logActivity(userId, userFirstName, userLastName, "Submitted Score for", "Defence");
      res.json({ success: true, data: sheet });
    } catch (err: any) {
      res
        .status(400)
        .json({
          success: false,
          error: 'Failed to submit score',
          message: err.message,
        });
    }
  }

  /** End a defence and compute averages */
  static async endDefence(req: AuthenticatedRequest, res: Response) {
    try {
      const { defenceId } = req.params;
      const userId = req.user?.id || '';
      const userFirstName = `${req.user?.title || ''} ${req.user?.firstName || ''}`;
      const userLastName = req.user?.lastName || '';
      const defence = await DefenceService.endDefence(defenceId);
      await ActivityLogService.logActivity(userId, userFirstName, userLastName, "Ended", "Defence");
      res.json({ success: true, data: defence });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to end defence', message: err.message });
    }
  }


  /** Approve defence for a student */
  static async approveStudentDefence(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const userId = req.user?.id || '';
      const userFirstName = `${req.user?.title || ''} ${req.user?.firstName || ''}`;
      const userLastName = req.user?.lastName || '';
      const student = await DefenceService.approveStudentDefence(studentId);
      await ActivityLogService.logActivity(userId, userFirstName, userLastName, "Approved", "Defence");
      res.json({ success: true, data: student });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to approve defence for student', message: err.message });
    }
  }


  /** Reject defence for a student */
  static async rejectStudentDefence(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const userId = req.user?.id || '';
      const userFirstName = `${req.user?.title || ''} ${req.user?.firstName || ''}`;
      const userLastName = req.user?.lastName || '';
      const student = await DefenceService.rejectStudentDefence(studentId);
      await ActivityLogService.logActivity(userId, userFirstName, userLastName, "Rejected", "Defence");
      res.json({ success: true, data: student });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to reject defence for student', message: err.message });
    }
  }

  /** Get a defence with student details */
  static async getDefenceDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { defenceId } = req.params;
      const panelMemberId = req.user?.id || '';
      const defence = await DefenceService.getDefenceDetails(defenceId, panelMemberId);
      res.json({ success: true, data: defence });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get defence details', message: err.message });
    }
  }

  /**GEt most recent defence */
  static async getDefenceForPanelMember(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || '';
      const { level } = req.params
      const defence = await DefenceService.getDefenceForPanelMember(level, userId);
      res.json({ success: true, data: defence });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to get most recent defence', message: err.message });
    }
  }
}

