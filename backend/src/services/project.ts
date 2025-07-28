import { Project, Student } from '../models/index';
import { Types } from 'mongoose';

export default class ProjectService {
  static async uploadProject(studentId: string, fileUrl: string, topic: string) {
    let project = await Project.findOne({ student: studentId });

    if (!project) {
      project = new Project({ student: studentId, versions: [] });
    }

    const nextVersion = project.versions.length + 1;

    project.versions.push({
      versionNumber: nextVersion,
      fileUrl,
      topic,
      uploadedBy: new Types.ObjectId(studentId),
      uploadedAt: new Date(),
      comments: [],
    });

    await project.save();
    await Student.findByIdAndUpdate(studentId, { projectTopic: topic });
    return project;
  }

  static async getProjectVersions(studentId: string) {
    const project = await Project.findOne({ student: studentId }).populate('versions.uploadedBy', 'name');
    if (!project) throw new Error('No project found for this student');
    return project.versions;
  }

  static async commentOnVersion(studentId: string, versionNumber: number, authorId: string, text: string) {
    const project = await Project.findOne({ student: studentId });
    if (!project) throw new Error('Project not found');

    const version = project.versions.find(v => v.versionNumber === versionNumber);
    if (!version) throw new Error('Version not found');

    version.comments.push({
      author: new Types.ObjectId(authorId),
      text,
      date: new Date(),
    });

    return await project.save();
  }

  static async getComments(studentId: string, versionNumber: number) {
    const project = await Project.findOne({ student: studentId })
      .populate('versions.comments.author', 'name');

    if (!project) throw new Error('Project not found');

    const version = project.versions.find(v => v.versionNumber === versionNumber);
    if (!version) throw new Error('Version not found');

    return version.comments;
  }

  static async supervisorUploadCorrection(studentId: string, fileUrl: string, topic: string, supervisorId: string) {
    const project = await Project.findOne({ student: studentId });
    if (!project) throw new Error('Project not found');

    const nextVersion = project.versions.length + 1;

    project.versions.push({
      versionNumber: nextVersion,
      fileUrl,
      topic,
      uploadedBy: new Types.ObjectId(supervisorId),
      uploadedAt: new Date(),
      comments: [],
    });

    return await project.save();
  }

  static async downloadProjectVersion(studentId: string, versionNumber: number) {
    const project = await Project.findOne({ student: studentId });

    if (!project) throw new Error('Project not found');

    const version = project.versions.find(v => v.versionNumber === versionNumber);
    if (!version) throw new Error('Version not found');

    return {
      fileUrl: version.fileUrl,
      topic: version.topic,
      uploadedAt: version.uploadedAt,
      uploadedBy: version.uploadedBy,
    };
  }
}
