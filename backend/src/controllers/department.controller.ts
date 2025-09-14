import { Request, Response } from 'express';
import DepartmentService from '../services/department'


export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
    permissions: string[];
    [key: string]: any;
  };
}


export default class DepartmentController {
  static async getAllDepartmentsForFaculty(req: AuthenticatedRequest, res: Response) {
    try {
      const facultyId = req.params.facultyId;
      const userId = req.user?.id || ''
      const departments = await DepartmentService.getAllDepartmentsForFaculty(facultyId, userId);
      res.json({ success: true, data: departments });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to fetch departments for faculty.', message: err.message });
    }
  }  

   static async getAllUserDepartments(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || ''
      const departments = await DepartmentService.getAllUserDepartments(userId);
      res.json({ success: true, data: departments });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to fetch departments for faculty.', message: err.message });
    }
  } 
}