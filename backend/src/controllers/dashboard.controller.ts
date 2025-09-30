// domain/dashboard/dashboard.controller.ts
import { Request, Response } from "express";
import {Student, Lecturer, Department, Faculty, Session, Defence, Notification} from "../models/index";


export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
    permissions: string[];
    [key: string]: any;
  };
}


export default class DashboardController {
  // 1. Assigned students for a supervisor
  static async getAssignedStudents(req: AuthenticatedRequest, res: Response) {
    try {
      const supervisorId = req.user?.id; 
      const students = await Student.find({
  $or: [
    { majorSupervisor: supervisorId },
    { minorSupervisor: supervisorId },
    { collegeRep: supervisorId },
    { internalExaminer: supervisorId }
  ]
});
      res.json({ success: true, count: students.length, students });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to get assigned students', message: err.message});
    }
  }

  // 2. Upcoming defences
  static async getUpcomingDefences(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || '';
      const defences = await Defence.find({ ended: false, panelMembers: userId })
      res.json({ success: true, count: defences.length, defences });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to get upcoming defences', message: err.message});
    }
  }

  // 3. Notifications for a user
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || '';
      const notifications = await Notification.countDocuments({ recipient: userId, read: false })
      res.json({ success: true, count: notifications, notifications });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to get notifications', message: err.message});
    }
  }

  // 4. Number of lecturers in department
  static async countLecturersInDept(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || '';
      const lecturerDept = await Lecturer.findById(userId).select('department');
      const dept = lecturerDept?.department;
      const count = await Lecturer.countDocuments({ department: dept });
      res.json({ success: true, count });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to get lecturers in a department', message: err.message});
    }
  }

  // 5. Number of lecturers in faculty
  static async countLecturersInFaculty(req: AuthenticatedRequest, res: Response) {
      try {
      const userId = req.user?.id || '';
      const lecturerDept = await Lecturer.findById(userId).select('faculty');
      const faculty = lecturerDept?.faculty;
      const count = await Lecturer.countDocuments({ faculty });
      res.json({ success: true, count });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to get lecturers in a faculty', message: err.message});
    }
  }

  // 6. Number of students in department
  static async countStudentsInDept(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || '';
      const lecturerDept = await Lecturer.findById(userId).select('department');
      const dept = lecturerDept?.department;
      const count = await Student.countDocuments({ department: dept });
      res.json({ success: true, count });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to get students in a department', message: err.message});
    }
  }

  // 7. Number of students in faculty
  static async countStudentsInFaculty(req: AuthenticatedRequest, res: Response) {
     try {
      const userId = req.user?.id || '';
      const lecturerDept = await Lecturer.findById(userId).select('faculty');
      const faculty = lecturerDept?.faculty;
      const count = await Student.countDocuments({ faculty });
      res.json({ success: true, count });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to get students in a faculty', message: err.message});
    }
  }

  // 8. Number of active sessions
  static async countActiveSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const count = await Session.countDocuments({ isActive: true });
      res.json({ success: true, count });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to add student', message: err.message});
    }
  }

  // 9. Number of departments in faculty
  static async countDepartmentsInFaculty(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const lecturerFaculty = await Lecturer.findById(userId).select('faculty');
      const count = await Department.countDocuments({ faculty: lecturerFaculty });
      res.json({ success: true, count });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({success: false, error: 'Failed to get departments in faculty', message: err.message});
    }
  }
}
