import { Defence, Student, User, Project } from '../models/index';
import { Types } from 'mongoose';
import NotificationService from "../services/notification";


export default class DefenceService {
  static async getAllDefenses() {
    return Defence.find().populate('students');
  }

  static async scheduleDefence(options: {
    stage: string;
    session: string;
    date: Date;
    studentIds: (string | Types.ObjectId)[];
    panelMemberIds: (string | Types.ObjectId)[];
  }) {
    const { stage, session, date, studentIds, panelMemberIds } = options;

    // Create new defence
    const defence = await Defence.create({
      stage,
      session,
      date,
      students: studentIds,
      panelMembers: panelMemberIds,
      started: false,
      ended: false,
    });

    // Fetch students with projects
    const students = await Student.find({ _id: { $in: studentIds } }).lean();
    const projects = await Project.find({ student: { $in: studentIds } }).lean();

    // Build message with project latest version
    const details = students.map((s) => {
      const proj = projects.find((p) => p.student.toString() === s._id.toString());
      const latest = proj?.versions?.[proj.versions.length - 1];

      return `
        Student: ${s.matricNo} (${s.level.toUpperCase()})
        Topic: ${latest?.topic ?? "No project yet"}
        Latest File: ${latest?.fileUrl ?? "N/A"}
      `;
    });

    const message = `You have been assigned to a ${stage} defence scheduled on ${date}.
    Students & their latest projects:
    ${details.join("\n\n")}
    `;

    await NotificationService.createNotifications({
      userIds: panelMemberIds,
      role: "panel",
      message,
    });

    return defence;
  }

  static async startDefence(defenceId: string) {
    const defence = await Defence.findById(defenceId).populate("students");
    if (!defence) throw new Error("Defence not found");
    if (defence.started) throw new Error("Defence already started");

    defence.started = true;
    await defence.save();

    // Collect supervisors from student docs
    const students = await Student.find({ _id: { $in: defence.students } }).lean();
    const supervisorIds = students
      .map((s) => s.majorSupervisor)
      .filter((id) => !!id);

    const message = `The ${defence.stage} defence has started. You may now score and comment on students.`;

    // Notify panel
    await NotificationService.createNotifications({
      userIds: defence.panelMembers,
      role: "panel",
      message,
    });

    // Notify supervisors
    if (supervisorIds.length > 0) {
      await NotificationService.createNotifications({
        lecturerIds: supervisorIds,
        role: "supervisor",
        message,
      });
    }

    return defence;
  }


  static async endDefence(defenceId: string, scores: {
    studentId: string;
    score: number;
  }[]) {
    const defence = await Defence.findById(defenceId).populate("students");
    if (!defence) throw new Error("Defence not found");
    if (!defence.started) throw new Error("Defence has not started");
    if (defence.ended) throw new Error("Defence already ended");

    // Update stageScores for each student
    for (const entry of scores) {
      const student = await Student.findById(entry.studentId);
      if (!student) continue;

      let key: keyof typeof student.stageScores;
      switch (defence.stage) {
        case "proposal":
        case "firstSeminar":
          key = "firstSeminar";
          break;
        case "secondSeminar":
          key = "secondSeminar";
          break;
        case "thirdSeminar":
          key = "thirdSeminar";
          break;
        case "external":
          key = "externalDefense";
          break;
        default:
          throw new Error(`Unknown defence stage: ${defence.stage}`);
      }

      // Average existing + new (if multiple panel scores are passed in)
      if (!student.stageScores[key]) student.stageScores[key] = 0;
      student.stageScores[key] = entry.score;
      await student.save();
    }

    defence.ended = true;
    await defence.save();

    // Notify students
    await NotificationService.createNotifications({
      studentIds: defence.students,
      role: "student",
      message: `Your ${defence.stage} defence has ended. Scores are now available.`,
    });

    return defence;
  }
}

