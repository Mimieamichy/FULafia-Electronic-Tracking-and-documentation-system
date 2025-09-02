import { Request, Response } from 'express';
import ProjectService from '../services/project';
import path from 'path';


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
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/projects/${req.file?.filename}`;
      const studentId = req.user?.id || ''

      const project = await ProjectService.uploadProject(studentId, fileUrl);
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

      const updatedProject = await ProjectService.commentOnVersion(
        studentId,
        parseInt(versionNumber),
        author,
        text
      );

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

  static async downloadProject(req: Request, res: Response) {
    try {
      const { studentId, versionNumber } = req.params;
      const project = await ProjectService.downloadProjectVersion(studentId, parseInt(versionNumber));
      if (!project || !project.fileUrl) {
      res.status(404).json({ success: false, error: 'Project not found' });
    }

    const fileName = path.basename(project.fileUrl);
    //construct the full file path
    const absolutePath = path.join('uploads', 'projects', fileName);

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
      const {comments} = req.body
      const fileUrl = req.file?.path || req.body.fileUrl;

      const project = await ProjectService.supervisorUploadCorrection(
        studentId,
        fileUrl,
        userId,
        comments
      );
      res.status(200).json({ success: true, message: 'Project uploaded succesfully', data: project });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to upload project', message: err.message });
    }
  }

  static async approveProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const project = await ProjectService.approveProject(studentId);
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


}