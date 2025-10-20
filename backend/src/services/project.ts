import { Project, Student, Session, DefenceComment, IDefenceComment, Defence, Lecturer } from '../models/index';
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
      comments: [],
      topic: student.projectTopic,
    });

    return await project.save();
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
    student.defenceMarked = false;

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


    return {
      student: {
        ...student.toObject(),
        sessionName: (student.session as any).sessionName
      },
      project
    };
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
  static async commentOnDefenceDay(studentId: string, defenceId: string, authorId: string, text: string): Promise<IDefenceComment> {
    console.log("GOOD")

    let defenceComment = await DefenceComment.findOne({
      defence: new Types.ObjectId(defenceId),
      student: new Types.ObjectId(studentId),
    });

    if (!defenceComment) {
      defenceComment = new DefenceComment({
        defence: new Types.ObjectId(defenceId),
        student: new Types.ObjectId(studentId),
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

  static async getCommentsByUserForStudent(defenceId: string, studentId: string, authorId: string) {

    const defenceComment = await DefenceComment.findOne({
      defence: defenceId,
      student: studentId,
    })
      .populate('comments.author', 'firstName lastName email');

    if (!defenceComment) {
      console.log("No comments found")
      return [];
    }

    // Filter comments by the specific author
    const userComments = defenceComment.comments.filter(comment =>
      comment.author._id.toString() === authorId.toString()
    );

    return userComments;
  }

  static async getDefenceDayComments(studentId: string) {
    const defence = await Defence.findOne({
      students: studentId,
      ended: true,
    }).sort({ createdAt: -1 })

    if (!defence) {
      throw new Error('No defence found for this student');
    }

    console.log(defence)

    const defenceComment = await DefenceComment.findOne({
      defence: defence._id,
      student: studentId,
    })
      .populate('comments.author', 'firstName lastName email') // Populate author details 

    console.log(defenceComment)

    return defenceComment;
  }

  static async checkStaleProjects() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const projects = await Project.find()
      .populate({
        path: "student",
        select: "majorSupervisor department user projectTopic matricNo",
        model: "Student"
      });

    for (const project of projects) {
      const s = project.student as any;
      if (!s || !s.majorSupervisor) continue;

      // Get all uploads by the student
      const studentUploads = project.versions.filter(
        v => v.uploadedBy?.toString() === s._id.toString()
      );
      if (!studentUploads.length) continue;

      // Find the most recent student upload
      const lastUpload = studentUploads.reduce((a, b) =>
        new Date(a.uploadedAt) > new Date(b.uploadedAt) ? a : b
      );

      // Skip if student uploaded within the last month
      if (new Date(lastUpload.uploadedAt) > oneMonthAgo) continue;

      // Check if supervisor uploaded after the last student upload
      const supUploads = project.versions.filter(
        v => v.uploadedBy?.toString() === s.majorSupervisor.toString()
      );
      const hasNewSupUpload = supUploads.some(
        v => new Date(v.uploadedAt) > new Date(lastUpload.uploadedAt)
      );
      if (hasNewSupUpload) continue;

      // Find HOD with 'hod' role in same department
      const hod = await Lecturer.findOne({ department: s.department })
        .populate({
          path: "user",
          match: { roles: "hod" },
          select: "roles"
        });

      if (!hod || !hod.user) {
        console.warn(`HOD not found for department: ${s.department}`);
        continue;
      }

      // Find Provost with 'provost' role
      const provost = await Lecturer.findOne()
        .populate({
          path: "user",
          match: { roles: "provost" },
          select: "roles"
        });

      if (!provost || !provost.user) {
        console.warn("Provost not found");
        continue;
      }

      // Collect recipients
      const recipients: (string | Types.ObjectId)[] = [
        hod._id as Types.ObjectId,
        provost._id as Types.ObjectId
      ];

      await NotificationService.createNotifications({
        lecturerIds: recipients,
        role: "admin",
        message: `Student ${s.matricNo} (${s.projectTopic}) uploaded a project over a month ago without supervisor feedback.`,
      });
    }
  }





}
