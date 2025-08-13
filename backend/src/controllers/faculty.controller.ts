import { Request, Response } from 'express';
import FacultyService from '../services/faculty'


export default class DepartmentController {
  static async getAllDepartmentsForFaculty(req: Request, res: Response) {
    try {
      const faculties = await FacultyService.getAllFaculties();
      res.json({ success: true, data: faculties });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to fetch Faculties.', message: err.message });
    }
  }

  static async getFacultyById(req: Request, res: Response) {
    try {
      const facultyId = req.params.facultyId;
      if (!facultyId) {
        res.status(400).json({ success: false, error: 'Faculty ID is required.' });
        return;
      }
      const faculty = await FacultyService.getFacultyById(facultyId);
      res.json({ success: true, data: faculty });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to fetch Faculties.', message: err.message });
    }
  }

}