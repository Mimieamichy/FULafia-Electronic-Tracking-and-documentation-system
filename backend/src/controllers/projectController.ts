import { Request, Response } from 'express';
import ProjectService from '../services/project';


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
      const { topic } = req.body;
      const fileUrl = req.file?.path || req.body.fileUrl;
      const studentId = req.user?.id || ''

      const project = await ProjectService.uploadProject(studentId, fileUrl, topic);
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

      return res.download(project.fileUrl);
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to download project', message: err.message });
    }
  }

  static async supervisorUploadCorrection(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || ''
      const { studentId, topic } = req.body;
      const fileUrl = req.file?.path || req.body.fileUrl;

      const project = await ProjectService.supervisorUploadCorrection(
        studentId,
        fileUrl,
        topic,
        userId
      );
      res.status(200).json({ success: true, message: 'Project uploaded succesfully', data: project });
    } catch (err: any) {
      console.log(err)
      res.status(400).json({ success: false, error: 'Failed to upload project', message: err.message });
    }
  }

}