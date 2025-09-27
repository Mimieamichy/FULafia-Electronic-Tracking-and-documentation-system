import { Project, Student,Session, DefenceComment, IDefenceComment } from '../models/index';
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

    function isDefined<T>(value: T | undefined | null): value is T {
      return value !== undefined && value !== null;
    }


    // 4. Notify major & minor supervisors 
    const supervisorIds = [student.majorSupervisor, student.minorSupervisor, student.internalExaminer, student.collegeRep].filter(isDefined)

    if (supervisorIds) {
      await NotificationService.createNotifications({
        lecturerIds: supervisorIds,
        role: "supervisor",
        message: `New project version uploaded by ${student.matricNo} (${student.projectTopic}).`,
      });
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

     function isDefined<T>(value: T | undefined | null): value is T {
      return value !== undefined && value !== null;
    }
    const correctStudentId = [studentId].filter(isDefined)
    await NotificationService.createNotifications({
        studentIds: correctStudentId,
        role: "student",
        message: `Your project has been approved by your supervisor you are now moved to ${nextStage}`,
      });

    return { project, student };
  }


  static async getStudentProjects(userId: string) {
    const student = await Student.findOne({ user: userId });
    if (!student) throw new Error("Student not found");

    // FORMAT Session YYYY/YYYY
    const sessionId = student.session as any;
    const session = await Session.findById(sessionId);
    if (!session) throw new Error("Session not found");
    student.session = session.sessionName as any;


    const project = await Project.findOne({ student: student._id })
      .populate("versions.uploadedBy", "firstName lastName email")
      .populate("versions.comments.author", "firstName lastName email");

    if (!project) throw new Error("Project not found");

    // format comments with lecturer info
    for (const version of project.versions) {
      for (const comment of version.comments as any[]) {
        const author = comment.author as any;

        comment.set(
          "authorName",
          `${author.title} ${author.firstName} ${author.lastName}`,
          { strict: false }
        );
      }
    }


    return { student, project };
  }

  static async downloadLatestProject(studentId: string) {
    const project = await Project.findOne({ student: studentId });

    if (!project) throw new Error("Project not found");

    // Get the latest version (last element in the versions array)
    const latestVersion = project.versions[project.versions.length - 1];
    
    if (!latestVersion) throw new Error("No project versions found");

    // Get student info
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    return {
        fileUrl: latestVersion.fileUrl,
        topic: latestVersion.topic, 
        }
  }


  // Add a comment on defnce day
  static async commentOnDefenceDay(defenceId: string, studentId: string, authorId: string, text: string): Promise<IDefenceComment> {

    let defenceComment = await DefenceComment.findOne({
      defence: new Types.ObjectId(defenceId),
      student: new Types.ObjectId(studentId),
    });

    if (!defenceComment) {
      defenceComment = new DefenceComment({
        defence: new Types.ObjectId(defenceId),
        student: studentId,
        comments: [],
      });
    }

    defenceComment.comments.push({
      author: new Types.ObjectId(authorId),
      text,
      createdAt: new Date(),
    });

    return await defenceComment.save();
  }

  static async getCommentsByUserForStudent(defenceId: string, studentId: string, authorId: string){
  const defenceComment = await DefenceComment.findOne({
    defence: new Types.ObjectId(defenceId),
    student: new Types.ObjectId(studentId),
  })
  .populate('comments.author', 'firstName lastName email');

  if (!defenceComment) {
    return [];
  }

  // Filter comments by the specific author
  const userComments = defenceComment.comments.filter(comment => 
    comment.author._id.toString() === authorId.toString()
  );

  return userComments;
}


static async getCommentsForStudent(defenceId: string, studentId: string): Promise<IDefenceComment | null> {
  const defenceComment = await DefenceComment.findOne({
    defence: new Types.ObjectId(defenceId),
    student: new Types.ObjectId(studentId),
  })
  .populate('comments.author', 'firstName lastName email') // Populate author details 

  return defenceComment;
}




}
