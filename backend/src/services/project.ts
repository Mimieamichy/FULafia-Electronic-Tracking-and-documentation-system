import { Project, Student, Lecturer, User } from '../models/index';
import NotificationService from '../services/notification';
import { Types } from 'mongoose';
import { STAGES } from "../utils/constants";

export default class ProjectService {
  static async uploadProject(userId: string, fileUrl: string) {
    // Find student linked to this user
    const student = await Student.findOne({ user: userId });
    if (!student) throw new Error("Student not found");


    // Find or create project for student
    let project = await Project.findOne({ student: student._id });
    if (!project) {
      project = new Project({ student: student._id, versions: [] });
    }

    const nextVersion = project.versions.length + 1;

    project.versions.push({
      versionNumber: nextVersion,
      fileUrl,
      uploadedBy: (student._id),
      uploadedAt: new Date(),
      comments: [],
      topic: student.projectTopic
    });

    await project.save();

    // 4. Notify major & minor supervisors (lookup by name if exists)
    // Split supervisor full name into parts (assuming format: "Title FirstName LastName")
    function parseName(fullName: string) {
      const parts = fullName.trim().split(" ");
      if (parts.length < 2) return { firstName: fullName, lastName: "" };

      // Last part = lastName, rest (except title) = firstName
      const lastName = parts.pop()!;
      const title = parts[0].endsWith(".") ? parts.shift() : null;
      const firstName = parts.join(" ");
      return { firstName, lastName, title };
    }

    const supervisorNames = [student.majorSupervisor, student.minorSupervisor].filter(Boolean);

    if (supervisorNames.length > 0) {
      const lecturerIds: string[] = [];

      for (const supName of supervisorNames) {
        if (!supName) continue; // Type guard to ensure supName is string
        const { firstName, lastName } = parseName(supName);

        // Find User by name
        const user = await User.findOne({ firstName, lastName });
        if (!user) continue;

        // Find Lecturer by user
        const lecturer = await Lecturer.findOne({ user: user._id });
        if (!lecturer) continue;

        lecturerIds.push(String(lecturer._id));
      }

      if (lecturerIds.length > 0) {
        await NotificationService.createNotifications({
          lecturerIds,
          role: "lecturer",
          message: `New project version uploaded by ${student.matricNo} (${student.projectTopic}).`,
        });
      }
    }

    return project;
  }

  static async getProjectVersions(studentId: string) {
    const project = await Project.findOne({ student: studentId }).populate(
      "versions.uploadedBy",
      "name"
    );
    if (!project) throw new Error("No project found for this student");
    return project.versions;
  }

  static async commentOnVersion(
    studentId: string,
    versionNumber: number,
    authorId: string,
    text: string
  ) {
    const project = await Project.findOne({ student: studentId });
    if (!project) throw new Error("Project not found");

    const version = project.versions.find(
      (v) => v.versionNumber === versionNumber
    );
    if (!version) throw new Error("Version not found");

    version.comments.push({
      author: new Types.ObjectId(authorId),
      text,
      date: new Date(),
    });

    return await project.save();
  }

  static async getComments(studentId: string, versionNumber: number) {
    const project = await Project.findOne({ student: studentId }).populate(
      "versions.comments.author",
      "name"
    );

    if (!project) throw new Error("Project not found");

    const version = project.versions.find(
      (v) => v.versionNumber === versionNumber
    );
    if (!version) throw new Error("Version not found");

    return version.comments;
  }

  static async supervisorUploadCorrection(
    studentId: string,
    fileUrl: string,
    supervisorId: string,
    comments: string
  ) {
    const project = await Project.findOne({ student: studentId });
    if (!project) throw new Error("Project not found");

    const nextVersion = project.versions.length + 1;
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    project.versions.push({
      versionNumber: nextVersion,
      fileUrl,
      uploadedBy: new Types.ObjectId(supervisorId),
      uploadedAt: new Date(),
      comments: [comments],
      topic: student.projectTopic,
    });

    return await project.save();
  }

  static async downloadProjectVersion(
    studentId: string,
    versionNumber: number
  ) {
    const project = await Project.findOne({ student: studentId });

    if (!project) throw new Error("Project not found");

    const version = project.versions.find(
      (v) => v.versionNumber === versionNumber
    );
    if (!version) throw new Error("Version not found");

    //Get student project toopic
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    return {
      fileUrl: version.fileUrl,
      topic: student.projectTopic,
      uploadedAt: version.uploadedAt,
      uploadedBy: version.uploadedBy,
    };
  }


  static async approveProject(studentId: string) {
    const project = await Project.findOne({ student: studentId });
    if (!project) throw new Error("Project not found");

    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    // Determine program type
    const programType = (student.level).toUpperCase()
    const stages = STAGES[programType as keyof typeof STAGES];
    if (!stages) throw new Error(`Unknown program type: ${programType}`);

    const stageKeys = Object.values(stages);
    const currentIndex = stageKeys.indexOf(student.currentStage);

    if (currentIndex === -1) {
      throw new Error(`Invalid current stage: ${student.currentStage}`);
    }

    // Check if already at last stage
    if (currentIndex === stageKeys.length - 1) {
      return { message: "Student has completed their program", student, project };
    }

    const nextStage = stageKeys[currentIndex + 1];

    // Update student stage
    student.currentStage = nextStage;

    await Promise.all([project.save(), student.save()]);

    return { project, student };
  }


  static async getStudentProjects(userId: string) {
    const student = await Student.findOne({user: userId});
    if (!student) throw new Error("Student not found");

    const project = await Project.findOne({ student: student._id })
      .populate('versions.uploadedBy', 'firstName lastName email')
      .populate('versions.comments.author', 'firstName lastName email');

    if (!project) throw new Error("Project not found");

    project.versions.forEach(version => {
      version.comments.forEach((comment: any) => {
        const author = comment.author as any;
        comment.set('authorName', `${author.firstName} ${author.lastName}`, { strict: false });
      });
    });

    return { student, project };

  }

}
