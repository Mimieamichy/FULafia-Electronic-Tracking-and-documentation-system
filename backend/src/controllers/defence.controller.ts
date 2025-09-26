import { Request, Response } from 'express';
import DefenceService from '../services/defence';



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
  static async scheduleDefence(req: Request, res: Response) {
    try {
      const defence = await DefenceService.scheduleDefence(req.body);
      res.json({ success: true, data: defence });
    } catch (err: any) {
      res.status(400).json({success: false,error: 'Failed to schedule defence',message: err.message});
    }
  }

  /** Start a defence */
  static async startDefence(req: Request, res: Response) {
    try {
      const { defenceId } = req.params;
      const defence = await DefenceService.startDefence(defenceId);
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
  static async submitScore(req: Request, res: Response) {
    try {
      const { defenceId, studentId, panelMemberId, scores } = req.body;
      const sheet = await DefenceService.submitScore(
        defenceId,
        panelMemberId,
        studentId,
        scores
      );
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
  static async endDefence(req: Request, res: Response) {
    try {
      const { defenceId } = req.params;
      const defence = await DefenceService.endDefence(defenceId);
      res.json({ success: true, data: defence });
    } catch (err: any) {
      res.status(400).json({success: false, error: 'Failed to end defence', message: err.message});
    }
  }


  /** Approve defence for each student */
  static async approveStudentDefence(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const student = await DefenceService.approveStudentDefence(studentId);
      res.json({ success: true, data: student });
    } catch (err: any) {
      res.status(400).json({success: false, error: 'Failed to approve defence for student', message: err.message});
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
      res.status(400).json({success: false,error: 'Failed to get defence details',message: err.message});
    }
  }

  /**GEt most recent defence */
  static async getLatestDefence(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || '';
      const {level} = req.params
      const defence = await DefenceService.getLatestDefence(level, userId);
      res.json({ success: true, data: defence });
    } catch (err: any) {
      res.status(400).json({success: false,error: 'Failed to get most recent defence',message: err.message});
    }
  }
}

