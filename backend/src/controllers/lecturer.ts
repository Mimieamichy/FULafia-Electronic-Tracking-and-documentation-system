import { Request, Response } from 'express';
import LecturerService from '../../services/lecturer'


export default class LecturerController {
static async getAllLecturers(req: Request, res: Response) {
    try {
      const lecturers = await LecturerService.getAllLecturers();
      res.json({ success: true, data: lecturers });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'invalid_credentials', message: err.message });
    }
  }

  static async deleteLecturer(req: Request, res: Response) {
    try {
      const lecturerId = req.params.id;
      await LecturerService.deleteLecturer(lecturerId);
      res.json({ success: true, message: 'Lecturer deleted successfully' })
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to delete lecturer', message: err.message });
    }
  }

  static async addLecturer(req: Request, res: Response) {
    try {
      const { email, title, firstName, lastName, department, faculty, staffId, role } = req.body;
      const hod = await LecturerService.addLecturer({ email, title, firstName, lastName, department, faculty, staffId, role });
      res.json({ success: true, data: hod });
    } catch (err: any) {
      console.log('Error adding HOD:', err);
      res.status(400).json({ success: false, error: 'Failed to add HOD', message: err.message });
    }
  }

  static async getHODs(req: Request, res: Response) {
      try {
        const hods = await LecturerService.getHODs();
        console.log('HODs:', hods);
        res.json({ success: true, data: hods });
      } catch (err: any) {
        console.log(err);
        res.status(400).json({ success: false, error: 'Failed to add HOD', message: err.message });
      }
    }
}
