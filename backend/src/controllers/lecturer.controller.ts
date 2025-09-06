import { Request, Response } from 'express';
import LecturerService from '../services/lecturer'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
    permissions: string[];
    [key: string]: any;
  };
}


export default class LecturerController {
  static async getAllLecturers(req: Request, res: Response) {
    try {
      const lecturers = await LecturerService.getAllLecturers();
      res.json({ success: true, data: lecturers });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'invalid_credentials', message: err.message });
    }
  }

  static async deleteLecturer(req: Request, res: Response) {
    try {
      const lecturerId = req.params.id;
      await LecturerService.deleteLecturer(lecturerId);
      res.json({ success: true, message: 'Lecturer deleted successfully' })
    } catch (err: any) {
      console.log("Error deleting lecturer:", err);
      res.status(400).json({ success: false, error: 'Failed to delete lecturer', message: err.message });
    }
  }

   static async editLecturer(req: Request, res: Response) {
    try {
      const lecturerId = req.params.id;
      const updateData = await LecturerService.editLecturer(lecturerId, req.body);
      res.json({ success: true, data: updateData})
    } catch (err: any) {
      console.log("Error deleting lecturer:", err);
      res.status(400).json({ success: false, error: 'Failed to edit lecturer', message: err.message });
    }
  }
  static async addLecturer(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, title, firstName, lastName, staffId, role } = req.body;
      const userId = req.user?.id || ''
      const lecturer = await LecturerService.addLecturer({ email, title, firstName, lastName, userId, staffId, role });
      res.json({ success: true, data: lecturer });
    } catch (err: any) {
      console.log('Error adding Lecturer:', err);
      res.status(400).json({ success: false, error: 'Failed to add Lecturer', message: err.message });
    }
  }


  static async addHOD(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, title, firstName, lastName, staffId, role, department, faculty } = req.body;
      const userId = req.user?.id || ''
      const hod = await LecturerService.addHOD({ email, title, firstName, lastName, userId, staffId, role, department, faculty });
      res.json({ success: true, data: hod });
    } catch (err: any) {
      console.log('Error adding HOD:', err);
      res.status(400).json({ success: false, error: 'Failed to add HOD', message: err.message });
    }
  }

    static async addDean(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, title, firstName, lastName, staffId, role, faculty } = req.body;
      const userId = req.user?.id || ''
      const dean = await LecturerService.addDean({ email, title, firstName, lastName, userId, staffId, role, faculty });
      res.json({ success: true, data: dean });
    } catch (err: any) {
      console.log('Error adding Dean:', err);
      res.status(400).json({ success: false, error: 'Failed to add Dean', message: err.message });
    }
  }


  static async addProvost(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, title, firstName, lastName, staffId, role } = req.body;
      const provost = await LecturerService.addProvost({ email, title, firstName, lastName, staffId, role });
      res.json({ success: true, data: provost });
    } catch (err: any) {
      console.log('Error adding Provost:', err);
      res.status(400).json({ success: false, error: 'Failed to add Provost', message: err.message });
    }
  }


  static async addExternalExaminer(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, title, firstName, lastName, role } = req.body;
      const external_examiner = await LecturerService.addExternalExaminer({ email, title, firstName, lastName, role });
      res.json({ success: true, data: external_examiner });
    } catch (err: any) {
      console.log('Error adding external_examiner:', err);
      res.status(400).json({ success: false, error: 'Failed to add external_examiner', message: err.message });
    }
  }

  static async getHODs(req: Request, res: Response) {
    try {
      const hods = await LecturerService.getHODs();
      res.json({ success: true, data: hods });
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ success: false, error: 'Failed to get HOD', message: err.message });
    }
  }


  static async getDeans(req: Request, res: Response) {
    try {
      const deans = await LecturerService.getDeans();
      res.json({ success: true, data: deans });
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ success: false, error: 'Failed to get Dean', message: err.message });
    }
  }

  static async getProvost(req: Request, res: Response) {
    try {
      const provost = await LecturerService.getProvost();
      res.json({ success: true, data: provost });
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ success: false, error: 'Failed to get Provost', message: err.message });
    }
  }


  
  static async getExternlExaminer(req: Request, res: Response) {
    try {
      const external_examiner = await LecturerService.getExternalExaminer();
      res.json({ success: true, data: external_examiner });
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ success: false, error: 'Failed to get External Examiner', message: err.message });
    }
  }


  static async getLecturerByDepartment(req: AuthenticatedRequest, res: Response){
    try {
      const userId = req.user?.id || '';
      const provost = await LecturerService.getLecturerByDepartment(userId);
      res.json({ success: true, data: provost });
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ success: false, error: 'Failed to add Provost', message: err.message });
    }
  }
}

