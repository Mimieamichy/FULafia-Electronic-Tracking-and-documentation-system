import { Request, Response } from 'express';
import ProjectService from '../services/project';
import ActivityLogService from '../services/activity_log';
import path from 'path';
import StudentService from '../services/students';
import UserService from '../services/user'



export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string[];
    permissions: string[];
    [key: string]: any;
  };
}

export default class ProjectController {
  static async uploadProject(req: AuthenticatedRequest, res: Response) {
    try {
      console.log(`Hello`)
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/projects/${req.file?.filename}`;
      const userId = req.user?.id || ''
      const role = req.user?.role[0] || ''
      const user = await UserService.getUserProfile(userId)
      const userName = `${user.user.title || ''} ${user.user.firstName || ''} ${user.user.lastName || ''}`;
      const student = await StudentService.getOneStudentByUser(userId)
       if (!student) {
        res.status(404).json({ success: false, error: 'Student not found' });
        return 
      }
      const studentData = await StudentService.getOneStudent(String(student._id));
      if (!studentData) {
        res.status(404).json({ success: false, error: 'Student not found' });
        return 
      }

      const project = await ProjectService.uploadProject(userId, fileUrl);
      await ActivityLogService.logActivity(userId, userName, role, 'Uploaded', 'a new Project version', studentData.department);
      res.status(201).json({ success: true, message: 'Project uploaded successfully', data: project });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to upload project', message: err.message });
    }
  }

  static async commentOnProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId, versionNumber } = req.params;
      const { text } = req.body;
      const author = req.user?.id || ''
      const role = req.user?.role[0] || ''
      const user = await UserService.getUserProfile(author)
      const userName = `${user.user.title || ''} ${user.user.firstName || ''} ${user.user.lastName || ''}`;

      const updatedProject = await ProjectService.commentOnVersion(
        studentId,
        parseInt(versionNumber),
        author,
        text
      );
      const studentData = await StudentService.getOneStudent(studentId);
      if (!studentData) {
        res.status(404).json({ success: false, error: 'Student not found' });
        return 
      }
      await ActivityLogService.logActivity(author, userName, role, 'Commented on', `${studentData.user.firstName} ${studentData.user.lastName} with matric No: ${studentData.matricNo} Project version ${versionNumber}`, studentData.department);
      res.status(200).json({ success: true, message: 'Comment added', data: updatedProject });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to comment on project', message: err.message });
    }
  } 

  static async viewComments(req: Request, res: Response) {
    try {
      const { studentId, versionNumber } = req.params;

      const comments = await ProjectService.getComments(studentId, parseInt(versionNumber));
      res.status(200).json({ success: true, message: 'Comments retrieved', data: comments });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to load comments', message: err.message });
    }
  }

  static async downloadProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId, versionNumber } = req.params;
      const author = req.user?.id || ''
      const role = req.user?.role[0] || ''
      const user = await UserService.getUserProfile(author)
      const userName = `${user.user.title || ''} ${user.user.firstName || ''} ${user.user.lastName || ''}`;
      const studentData = await StudentService.getOneStudent(studentId);
      if (!studentData) {
        res.status(404).json({ success: false, error: 'Student not found' });
        return
      }
      const project = await ProjectService.downloadProjectVersion(studentId, parseInt(versionNumber));
      if (!project || !project.fileUrl) {
      res.status(404).json({ success: false, error: 'Project not found' });
    }

    const fileName = path.basename(project.fileUrl);
    //construct the full file path
    const absolutePath = path.join('uploads', 'projects', fileName);
      await ActivityLogService.logActivity(author, userName, role, 'downloaded project', `of ${studentData.user.firstName} ${studentData.user.lastName} with matric No: ${studentData.matricNo} Project version number ${versionNumber}`, studentData.department);
      return res.download(absolutePath);
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to download project', message: err.message });
    }
  }

  static async downloadLatestProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const userId = req.user?.id || ''
      const role = req.user?.role[0] || ''
      const user = await UserService.getUserProfile(userId)
      const userName = `${user.user.title || ''} ${user.user.firstName || ''} ${user.user.lastName || ''}`;
      const project = await ProjectService.downloadLatestProject(studentId);
      if (!project || !project.fileUrl) {
      res.status(404).json({ success: false, error: 'Project not found' });
       return 
    }

    const fileName = path.basename(project.fileUrl);
    const studentData = await StudentService.getOneStudent(studentId);
      if (!studentData) {
       res.status(404).json({ success: false, error: 'Student not found' });
      return 
      }
    //construct the full file path
    const absolutePath = path.join('uploads', 'projects', fileName);
      await ActivityLogService.logActivity(userId, userName, role, 'Downloaded', `Latest Project version of ${studentData.user.firstName} ${studentData.user.lastName} with matric No: ${studentData.matricNo}`, studentData.department);
      return res.download(absolutePath);
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to download project', message: err.message });
    }
  }

  static async supervisorUploadCorrection(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || ''
      const { studentId } = req.params;
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/projects/${req.file?.filename}`;
      const role = req.user?.role[0] || ''
      const user = await UserService.getUserProfile(userId)
      const userName = `${user.user.title || ''} ${user.user.firstName || ''} ${user.user.lastName || ''}`;
      const student = await StudentService.getOneStudent(studentId)
       if (!student) {
        res.status(404).json({ success: false, error: 'Student not found' });
        return 
      }
      const studentData = await StudentService.getOneStudent(String(student._id));
      if (!studentData) {
        res.status(404).json({ success: false, error: 'Student not found' });
        return 
      }
      await ActivityLogService.logActivity(userId, userName, role, 'Uploaded', `a corrected project for ${studentData.user.firstName} ${studentData.user.firstName} with matric No ${studentData.matricNo} `, studentData.department);

      const project = await ProjectService.supervisorUploadCorrection(
        studentId,
        fileUrl,
        userId,
      );
      res.status(200).json({ success: true, message: 'Project uploaded succesfully by supervisor', data: project });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to upload project', message: err.message });
    }
  }

  static async approveProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const userId = req.user?.id || ''
      const role = req.user?.role[0] || ''
      const user = await UserService.getUserProfile(userId)
      const userName = `${user.user.title || ''} ${user.user.firstName || ''} ${user.user.lastName || ''}`;
      const studentData = await StudentService.getOneStudent(studentId);
      if (!studentData) {
        res.status(404).json({ success: false, error: 'Student not found' });
        return 
      }
      const project = await ProjectService.approveProject(studentId);
      await ActivityLogService.logActivity(userId, userName, role, 'Approved', `Project of ${studentData.user.firstName} ${studentData.user.lastName} with matric No: ${studentData.matricNo} for defence`, studentData.department);
      res.status(200).json({ success: true, message: 'Project approved successfully', data: project });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to approve project', message: err.message });
    }
  }

  static async getStudentProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.params.userId 
      const projects = await ProjectService.getStudentProjects(userId);
      res.status(200).json({ success: true, message: 'Projects retrieved', data: projects });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to get student project(s)', message: err.message });
    }
  }

  static async commentOnDefenceDay(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId, defenceId } = req.params;
      const { text } = req.body;
      const author = req.user?.id || ''
      const userId = req.user?.id || ''
      const role = req.user?.role[0] || ''
      const user = await UserService.getUserProfile(userId)
      const userName = `${user.user.title || ''} ${user.user.firstName || ''} ${user.user.lastName || ''}`;
      const studentData = await StudentService.getOneStudent(studentId);
      if (!studentData) {
        res.status(404).json({ success: false, error: 'Student not found' });
        return 
      }

      const comments = await ProjectService.commentOnDefenceDay(
        studentId,
        defenceId,
        author,
        text
      );
      await ActivityLogService.logActivity(userId, userName, role, 'Commented on', `${studentData.user.firstName} ${studentData.user.lastName} with matric No: ${studentData.matricNo} project on Defence day`, studentData.department);
      res.status(200).json({ success: true, message: 'Comment added', data: comments });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to comment on project on defence day', message: err.message });
    }
  } 

  static async getCommentsByUserForStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId, defenceId } = req.params;
      const authorId = req.user?.id || ''

      const comments = await ProjectService.getCommentsByUserForStudent(defenceId, studentId, authorId);
      res.status(200).json({ success: true, message: 'Comments retrieved', data: comments });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to load comments ffrom defence day', message: err.message });
    }
  }


  static async getDefenceDayComments(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      const comments = await ProjectService.getDefenceDayComments(studentId);
      res.status(200).json({ success: true, message: 'Comments retrieved', data: comments });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to load comments for defence day', message: err.message });
    }
  }
}