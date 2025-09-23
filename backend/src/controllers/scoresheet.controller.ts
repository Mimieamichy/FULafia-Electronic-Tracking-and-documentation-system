import { Request, Response } from 'express';
import ScoreSheetService from '../services/scoresheet';



export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
    permissions: string[];
    [key: string]: any;
  };
}
export default class ScoreSheetController {
    
    
/** Create a department-wide template score sheet */
  static async createDeptScoreSheet(req: AuthenticatedRequest, res: Response) {
    try {
      const { criteria } = req.body;
      const userId = req.user?.id || ''
      const scoreSheet = await ScoreSheetService.createDeptScoreSheet(criteria, userId);
      res.json({ success: true, data: scoreSheet });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to create department score sheet', message: err.message});
    }
  }


   static async getDeptScoreSheet(req: AuthenticatedRequest, res: Response) {
    try {
      const {scoresheetId} = req.params
      const scoreSheet = await ScoreSheetService.getDeptScoreSheet(scoresheetId);
      res.json({ success: true, data: scoreSheet });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to get department score sheet', message: err.message});
    }
  }

  
  static async UpdateCriterionDeptScoreSheet(req: AuthenticatedRequest, res: Response) {
    try {
      const { criteria } = req.body;
      const { criterionId } = req.params;
      const userId = req.user?.id || ''
      const scoreSheet = await ScoreSheetService.UpdateCriterionDeptScoreSheet(userId, criterionId, criteria);
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
      const scoreSheet = await ScoreSheetService.createGeneralScoreSheet(criteria);
      res.json({ success: true, data: scoreSheet });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false,error: 'Failed to create general score sheet',message: err.message});
    }
  }

    static async updateGenCriterion(req: AuthenticatedRequest, res: Response) {
    try {
      const { criteria } = req.body
      const { criterionId } = req.params;
      const scoreSheet = await ScoreSheetService.updateGenCriterion(criterionId, criteria);
      res.json({ success: true, data: scoreSheet });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to update general score sheet', message: err.message});
    }
  }


  static async deleteCriterionDeptScoreSheet(req: AuthenticatedRequest, res: Response) {
    try {
      const { criterionId } = req.params;
      const userId = req.user?.id || ''
      const deletedId = await ScoreSheetService.deleteCriterionDeptScoreSheet(userId, criterionId);
      res.json({ success: true, data: deletedId });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to delete criterion', message: err.message});
    }
  }

  static async deleteGenCriterion(req: AuthenticatedRequest, res: Response) {
    try {
      const { criterionId } = req.params;
      const deletedId = await ScoreSheetService.deleteGenCriterion(criterionId);
      res.json({ success: true, data: deletedId });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to delete criterion', message: err.message});
    }
  }
}