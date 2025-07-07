import { Project, IProject } from "../models/index";
import { Response } from "express";
import fs from "fs"
import path from "path"
import { Types } from "mongoose";

export default class ProjectService {
  static async addProject(projectData: IProject) {
    const project = new Project(projectData);
    return project.save();
  }

  static async getAllProjects() {
    return Project.find()
      .populate({
        path: "student",
        populate: { path: "user" },
      })
      .lean();
  }

  static async getProjectByDepartment(department: string) {
    return Project.find()
      .populate({
        path: "student",
        match: { department },
        populate: { path: "user" },
      })
      .lean()
      .then(projects => projects.filter(p => p.student)); // drop non‑matches
  }

  static async getProjectByFaculty(faculty: string) {
    return Project.find()
      .populate({
        path: "student",
        match: { faculty },
        populate: { path: "user" },
      })
      .lean()
      .then(projects => projects.filter(p => p.student));
  }

  static async deleteProject(projectId: string) {
    return Project.findByIdAndDelete(projectId);
  }

  static async downloadProjectFile(projectId: string, fileUrl: string, res: Response) {
    const project = await Project.findById(projectId).lean();

    if (!project) {
      throw new Error("Project not found");
    }

    const filePath = path.resolve(fileUrl); 

    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist on the server");
    }

    // Set appropriate headers and stream the file
    res.download(filePath, path.basename(filePath));
  }


  static async uploadVersion({
    studentId,
    topic,
    fileUrl,
    uploadedBy,
  }: {
    studentId: Types.ObjectId | string;
    topic: string;
    fileUrl: string;
    uploadedBy: Types.ObjectId | string;
  }): Promise<IProject> {
    let project = await Project.findOne({ student: studentId });

    // Create a new project if none exists
    if (!project) {
      project = new Project({
        student: studentId,
        versions: [],
      });
    }

    // Add new version
    await project.addVersion(fileUrl, topic, new Types.ObjectId(uploadedBy));

    return project;
  }



}
