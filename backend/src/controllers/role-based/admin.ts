// src/services/AdminService.ts
import LecturerService from '../../services/lecturer'
import ActivityLogService from '../../services/activity_log'
import  { Request, Response } from 'express';

export default class AdminController {
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
      res.status(400).json({ success: false, error: 'Failed to delete lecturer', message: err.message});
    }
  }

  static async addHOD(req: Request, res: Response) {
    try {
        const { email, title, password, firstName, lastName, department, faculty, staffId } = req.body;
        const hod = await LecturerService.addHOD({email, title, password, firstName, lastName, department, faculty, staffId });
        res.json({ success: true, data: hod });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to add HOD', message: err.message});
    }
  }



//   static async getAllSessions() {
//     return Session.find().populate('students');
//   }

//   static async getAllStudents() {
//     return Student.find();
//   }

//   static async getAllProjects() {
//     return Project.find().populate('student');
//   }

//   static async getAllDefenses() {
//     return Defence.find().populate('students');
//   }

  static async getActivityLogs(req: Request, res: Response) {
  try {
    const logs = await ActivityLogService.getHistory(100);
    return res.json({ success: true, data: logs });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: 'server_error', message: err.message });
  }
}
}
