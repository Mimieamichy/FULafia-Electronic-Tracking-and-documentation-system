import { Request, Response } from 'express';
import StudentService from "../services/students";
import { Types } from "mongoose";


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
      const { firstName, lastName, email, degree: level, matNo: matricNo, session, projectTopic } = req.body;
      const userId = req.user?.id || ''

      const newStudent = await StudentService.addStudent({
        firstName,
        lastName,
        email,
        level,
        matricNo,
        userId,
        session,
        projectTopic,
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


  static async getAllMscStudentsByDepartment(req: AuthenticatedRequest, res: Response) {
  try {
    const { department, session} = req.params;
    const userId = req.user?.id || '';

    // Query params for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sessionId = new Types.ObjectId(session);
    

    const students = await StudentService.getAllMscStudentsInDepartment(
      department,
      userId,
      sessionId,
      page,
      limit
    );

    res.status(200).json({ success: true, ...students });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      error: 'Failed to get MSC students in department',
      message: err.message,
    });
  }
}



static async getAllMscStudentsInFaculty(req: AuthenticatedRequest, res: Response) {
  try {
    const { faculty, session} = req.params;
    const userId = req.user?.id || '';

    // Query params for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sessionId = new Types.ObjectId(session);
    

    const students = await StudentService.getAllMscStudentsInFaculty(
      faculty,
      userId,
      sessionId,
      page,
      limit
    );

    res.status(200).json({ success: true, ...students });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      error: 'Failed to get MSC students in faculty',
      message: err.message,
    });
  }
}


static async getAllPhdStudentsByDepartment(req: AuthenticatedRequest, res: Response) {
  try {
    const { department, session} = req.params;
    const userId = req.user?.id || '';

    // Query params for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sessionId = new Types.ObjectId(session);
    

    const students = await StudentService.getAllPhdStudentsInDepartment(
      department,
      userId,
      sessionId,
      page,
      limit
    );

    res.status(200).json({ success: true, ...students });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      error: 'Failed to PHD get students in department',
      message: err.message,
    });
  }
}


static async getAllPhdStudentsInFaculty(req: AuthenticatedRequest, res: Response) {
  try {
    const { faculty, session} = req.params;
    const userId = req.user?.id || '';

    // Query params for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sessionId = new Types.ObjectId(session);
    

    const students = await StudentService.getAllPhdStudentsInFaculty(
      faculty,
      userId,
      sessionId,
      page,
      limit
    );

    res.status(200).json({ success: true, ...students });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      error: 'Failed to get PHD students in faculty',
      message: err.message,
    });
  }
}


static async assignSupervisor(req: Request, res: Response) {
    try {
      const {staffId, staffName, type} = req.body
      const { matricNo } = req.params;
      const assignedStudent = await StudentService.assignSupervisor(staffId, staffName, type, matricNo)
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

static async getStudentsBySupervisorMsc(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || '';
      const students = await StudentService.getStudentsBySupervisorMsc(userId);
      res.status(200).json({ success: true, data: students });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        success: false,
        error: 'Failed to get students',
        message: err.message,
      });
    }
  }

  

  
static async getStudentsBySupervisorPhd(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || '';
      const students = await StudentService.getStudentsBySupervisorPhd(userId);
      res.status(200).json({ success: true, data: students });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        success: false,
        error: 'Failed to get students',
        message: err.message,
      });
    }
  }

static async editStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const { matricNo, firstName, lastName, projectTopic } = req.body;
      const updatedStudent = await StudentService.editStudent( studentId,{
        matricNo,
        firstName,
        lastName,
        projectTopic

      });
      res.status(200).json({ success: true, data: updatedStudent });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        success: false,
        error: 'Failed to update student',
        message: err.message,
      });
    }
  }

  static async deleteStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const {deletedStudent, deletedUser} = await StudentService.deleteStudent(studentId);
      res.status(200).json({ success: true, data: deletedStudent, deletedUser });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        success: false,
        error: 'Failed to delete student',
        message: err.message,
      });
    }
  }

  static async assignCollegeRep(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId, staffId } = req.params;
      const {updatedLecturer, updatedStudent} = await StudentService.assignCollegeRep(staffId, studentId)
      res.status(200).json({ success: true, data: updatedStudent, updatedLecturer });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({
        success: false,
        error: 'Failed to assign college rep',
        message: err.message,
      });
    }
  }


}