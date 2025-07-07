// src/services/AdminService.ts
import { Request, Response } from 'express';
import LecturerService from '../../services/lecturer'
import ActivityLogService from '../../services/activity_log'
import SessionService from '../../services/session'
import StudentService from "../../services/students";
import ProjectService from '../../services/project';


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
      res.status(400).json({ success: false, error: 'Failed to delete lecturer', message: err.message });
    }
  }

  static async addHOD(req: Request, res: Response) {
    try {
      const { email, title, firstName, lastName, department, faculty, staffId } = req.body;
      const hod = await LecturerService.addHOD({ email, title, firstName, lastName, department, faculty, staffId });
      res.json({ success: true, data: hod });
    } catch (err: any) {
      console.log('Error adding HOD:', err);
      res.status(400).json({ success: false, error: 'Failed to add HOD', message: err.message });
    }
  }

  static async getHODs(req: Request, res: Response) {
    try {
      const hods = await LecturerService.getHODs();
      res.json({ success: true, data: hods });
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ success: false, error: 'Failed to add HOD', message: err.message });
    }
  }

  static async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = await SessionService.getAllSessions();
      res.json({ success: true, data: sessions });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get all sessions', message: err.message });
    }
  }

  static async getAllStudents(req: Request, res: Response) {
    try {
      const students = await StudentService.getAllStudents();
      res.json({ success: true, data: students });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get all students', message: err.message });
    }
  }


  static async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await ProjectService.getAllProjects();
      res.json({ success: true, data: projects });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get all projects', message: err.message });
    }
  }


  static async getActivityLogs(req: Request, res: Response) {
    try {
      const logs = await ActivityLogService.getHistory(100);
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to get all activities', message: err.message });
    }
  }
}
