import  { Request, Response } from 'express';
import DefenceService from '../../services/defence';

export default class DefenceController {
  static async getAllDefences(req: Request, res: Response) {
    try {
        const defences = await DefenceService.getAllDefenses();
        res.json({ success: true, data: defences });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get all defences', message: err.message});
    }
  }

}

