import { Request, Response } from 'express';
import ProjectService from '../../services/project';
import { Lecturer } from "../../models/index";
import type multer from 'multer';
 


export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
    [key: string]: any;
    };  
  file?: multer.File;
}

export default class ProjectController {
  static async uploadProjectVersion(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id || '';
      const uploadedBy = req.user?.id || ''
      const { topic } = req.body;
      const file = req.file;

      if (!studentId || !topic || !file) {
        res.status(400).json({
          success: false,
          message: 'Missing student ID, topic, or file',
        });
      }

      const fileUrl = `/uploads/${file.filename}`;

      const project = await ProjectService.uploadVersion({
        studentId,
        topic,
        fileUrl,
        uploadedBy,
      });

    res.status(200).json({
        success: true,
        message: 'Project version uploaded successfully',
        data: project,
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to upload project version',
        error: err.message,
      });
    }
  }

  static async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await ProjectService.getAllProjects();
      res.json({ success: true, data: projects });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to get projects', message: err.message });
    }
  }

  static async getProjectByDepartment(req: AuthenticatedRequest, res: Response) {
  try {
    const lecturer = await Lecturer.findOne({ user: req.user?.id });
    if (!lecturer) {
      return res.status(403).json({ success: false, message: 'Lecturer not found' });
    }

    const department = lecturer.department;
    if (!department) {
      return res.status(400).json({ success: false, message: 'Lecturer department not found' });
    }
    const projects = await ProjectService.getProjectByDepartment(department);
    res.json({ success: true, data: projects });
  } catch (err: any) {
    res.status(400).json({ success: false, error: 'Failed to get department projects', message: err.message });
  }
}

  static async getProjectByFaculty(req: AuthenticatedRequest, res: Response) {
  try {
    const lecturer = await Lecturer.findOne({ user: req.user?.id });
    if (!lecturer) {
      return res.status(403).json({ success: false, message: 'Lecturer not found' });
    }

    const faculty = lecturer.faculty;
    if (!faculty) {
      return res.status(400).json({ success: false, message: 'Lecturer department not found' });
    }

    const projects = await ProjectService.getProjectByFaculty(faculty);
    res.json({ success: true, data: projects });
  } catch (err: any) {
    res.status(400).json({ success: false, error: 'Failed to get faculty projects', message: err.message });
  }
}

  static async deleteProject(req: AuthenticatedRequest, res: Response) {
    try {
      const { projectId } = req.params;
      await ProjectService.deleteProject(projectId);
      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to delete project', message: err.message });
    }
  }

  static async downloadProjectFile(req: AuthenticatedRequest, res: Response) {
    try {
        const { projectId } = req.params;
        const fileUrl = req.query.fileUrl as string; // check this
        await ProjectService.downloadProjectFile(projectId, fileUrl, res);
        res.json({ success: true, message: 'Project file downloaded successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, error: 'Failed to download project file', message: err.message });
    }
  }

}