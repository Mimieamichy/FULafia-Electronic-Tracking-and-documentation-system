import { Request, Response } from 'express';
import StudentService from "../services/students";


export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
    permissions: string[];
    [key: string]: any;
  };
}


export default class StudentController {
  static async addStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { firstName, lastName, email, degree: level, matNo: matricNo, session } = req.body;
      const userId = req.user?.id || ''

      const newStudent = await StudentService.addStudent({
        firstName,
        lastName,
        email,
        level,
        matricNo,
        userId,
        session,
      });

      res.status(201).json({ success: true, data: newStudent });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({
        success: false,
        error: 'Failed to add student',
        message: err.message,
      });
    }
  }


  static async getAllStudentsByDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const { department } = req.body
      const userId = req.user?.id || ''

      const students = await StudentService.getAllStudentsInDepartment(department, userId)
      res.status(201).json({ success: true, data: students });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({
        success: false,
        error: 'Failed to get students',
        message: err.message,
      });
    }

  }

  static async assignSupervisor(req: Request, res: Response) {
    try {
      const {staffId, type, matricNo} = req.body
      const assignedStudent = await StudentService.assignSupervisor(staffId, type, matricNo)
      res.status(201).json({ success: true, data: assignedStudent });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({
        success: false,
        error: 'Failed to assign supervisors',
        message: err.message,
      });
    }
  }

}