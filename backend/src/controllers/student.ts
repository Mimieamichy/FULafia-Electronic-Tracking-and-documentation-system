 import { Request, Response } from 'express';
 import StudentService from "../../services/students";
 
 
 export default class StudentController {
    static async getAllStudents(req: Request, res: Response) {
    try {
      const students = await StudentService.getAllStudents();
      res.json({ success: true, data: students });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get all students', message: err.message });
    }
  }
}