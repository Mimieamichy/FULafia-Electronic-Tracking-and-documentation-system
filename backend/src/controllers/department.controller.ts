import { Request, Response } from 'express';
import DepartmentService from '../services/department'


export default class DepartmentController {
  static async getAllDepartmentsForFaculty(req: Request, res: Response) {
    try {
      const facultyId = req.params.facultyId;
      const departments = await DepartmentService.getAllDepartmentsForFaculty(facultyId);
      res.json({ success: true, data: departments });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to fetch departments for faculty.', message: err.message });
    }
  }

}