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
      res
        .status(400)
        .json({
          success: false,
          error: 'Failed to schedule defence',
          message: err.message,
        });
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
      res
        .status(400)
        .json({
          success: false,
          error: 'Failed to end defence',
          message: err.message,
        });
    }
  }

  /** Create a department-wide template score sheet */
  static async createDeptScoreSheet(req: AuthenticatedRequest, res: Response) {
    try {
      const { criteria } = req.body;
      const userId = req.user?.id || ''
      const scoreSheet = await DefenceService.createDeptScoreSheet(criteria, userId);
      res.json({ success: true, data: scoreSheet });
    } catch (err: any) {
      console.log(err)
      res
        .status(400)
        .json({
          success: false,
          error: 'Failed to create department score sheet',
          message: err.message,
        });
    }
  }

  static async UpdateCriterionDeptScoreSheet(req: AuthenticatedRequest, res: Response) {
    try {
      const { criteria } = req.body;
      const { criteriaId } = req.params;
      const userId = req.user?.id || ''
      const scoreSheet = await DefenceService.UpdateCriterionDeptScoreSheet(userId, criteria, criteriaId);
      res.json({ success: true, data: scoreSheet });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to update department score sheet', message: err.message});
    }
  }


    /** Create a general template score sheet */
  static async createGeneralScoreSheet(req: AuthenticatedRequest, res: Response) {
    try {
      const { criteria } = req.body;
      const scoreSheet = await DefenceService.createGeneralScoreSheet(criteria);
      res.json({ success: true, data: scoreSheet });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false,error: 'Failed to create general score sheet',message: err.message});
    }
  }

    static async UpdateGenScoreSheet(req: AuthenticatedRequest, res: Response) {
    try {
      const { criteria } = req.body
      const scoreSheet = await DefenceService.UpdateGenScoreSheet(criteria);
      res.json({ success: true, data: scoreSheet });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to update general score sheet', message: err.message});
    }
  }

}

