import { Defence, Student, Project, ScoreSheet, Lecturer, GeneralScoreSheet } from '../models/index';
import mongoose, { Types } from 'mongoose';
import NotificationService from "../services/notification";
import { STAGES } from "../utils/constants";

export default class DefenceService {
  /** Get all defences with student details
   */
  static async getAllDefenses() {
    return Defence.find().populate('students');
  }

  /**
   * Schedule a new defence
   * Creates empty score sheet with criteria
   * Notifies panel members with student details & project links
   */
  static async scheduleDefence(options: {
    stage: string;
    program: "MSC" | "PHD";
    session: string;
    date: Date;
    time: string;
    studentIds: (string | Types.ObjectId)[];
    panelMemberIds: (string | Types.ObjectId)[];
    criteria: { name: string; weight: number }[];
  }) {
    const { stage, session, date, time, studentIds, panelMemberIds, program } = options;

    // Create defence
    const defence = await Defence.create({
      stage,
      program,
      session,
      date,
      time,
      students: studentIds,
      panelMembers: panelMemberIds,
      started: false,
      ended: false,
    });


    const criteria = ScoreSheet.find({}).lean();

    // Attach defence to global score sheet

    // Attach empty score sheet
    await ScoreSheet.create({
      defence: defence._id as Types.ObjectId,
      criteria: criteria,
      entries: [], // no scores yet
    });





    // Fetch students with projects
    const students = await Student.find({ _id: { $in: studentIds } })
      .populate("user", "firstName lastName")
      .lean();

    const projects = await Project.find({ student: { $in: studentIds } }).lean();

    // Build message
    const details = students.map((s) => {
      const proj = projects.find((p) => p.student.toString() === s._id.toString());
      const latest = proj?.versions?.[proj.versions.length - 1];

      const fullName = `${(s.user as any)?.firstName ?? ""} ${(s.user as any)?.lastName ?? ""}`.trim();

      return `
        Matric No: ${s.matricNo}
        Name: ${fullName}
        Topic: ${latest?.topic ?? "No project yet"}
        Latest File: ${latest?.fileUrl ?? "N/A"}
      `;
    });

    const message = `You have been assigned to be part of the panel members for ${stage} defence scheduled on ${date}, 
    Time: ${time}.
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

  /**
   * Marks defence as started
   * Notifies panel members and supervisors
   */
  static async startDefence(defenceId: string) {
    const defence = await Defence.findById(defenceId).populate("students");
    if (!defence) throw new Error("Defence not found");
    if (defence.started) throw new Error("Defence already started");

    defence.started = true;
    await defence.save();

    // Supervisors
    const students = await Student.find({ _id: { $in: defence.students } }).lean();
    const supervisorIds = students
      .map((s) => s.majorSupervisor)
      .filter((id): id is string => !!id)
      .map((id) => new Types.ObjectId(id));

    const message = `The ${defence.stage} defence has started. You may now score and comment on students' project.`;

    await NotificationService.createNotifications({
      userIds: defence.panelMembers,
      role: "panel",
      message,
    });

    if (supervisorIds.length > 0) {
      await NotificationService.createNotifications({
        lecturerIds: supervisorIds,
        role: "supervisor",
        message,
      });
    }

    return defence;
  }

  /**
   * Panel member submits score for a student
   */
  static async submitScore(
    defenceId: string,
    panelMemberId: string,
    studentId: string,
    scores: { criterion: string; score: number }[]
  ) {
    // Load the score sheet for this defence
    const scoreSheet = await ScoreSheet.findOne({ defence: defenceId });
    if (!scoreSheet) throw new Error('ScoreSheet not found for this defence');

    // Basic payload checks
    if (!Array.isArray(scores) || scores.length === 0) {
      throw new Error('Scores array is required and cannot be empty');
    }

    // Defined criteria on the sheet
    const definedCriteria = scoreSheet.criteria.map((c) => c.name);
    const definedCriteriaSet = new Set(definedCriteria);

    // Submitted criteria checks: duplicates, missing or extra criteria
    const submittedCriteria = scores.map((s) => s.criterion);
    const submittedSet = new Set(submittedCriteria);

    if (submittedSet.size !== submittedCriteria.length) {
      throw new Error('Duplicate criteria found in submission');
    }
    if (submittedCriteria.length !== definedCriteria.length) {
      throw new Error(
        `You must submit scores for exactly ${definedCriteria.length} criteria`
      );
    }
    // Ensure exact match (no extras, no missing)
    for (const crit of submittedCriteria) {
      if (!definedCriteriaSet.has(crit)) {
        throw new Error(`Invalid criterion submitted: ${crit}`);
      }
    }

    // Validate numeric ranges for each score
    for (const s of scores) {
      if (typeof s.score !== 'number' || Number.isNaN(s.score)) {
        throw new Error(`Score for criterion "${s.criterion}" must be a number`);
      }
      if (s.score < 0 || s.score > 100) {
        throw new Error(
          `Score for criterion "${s.criterion}" must be between 0 and 100`
        );
      }
    }

    // Ensure panel member hasn't already scored this student for this defence
    const already = scoreSheet.entries.find(
      (e) =>
        e.student.toString() === studentId &&
        e.panelMember.toString() === panelMemberId
    );
    if (already) {
      throw new Error('You have already submitted scores for this student');
    }

    // Add the entry
    scoreSheet.entries.push({
      student: new Types.ObjectId(studentId),
      panelMember: new Types.ObjectId(panelMemberId),
      scores,
    });

    await scoreSheet.save();

    // Return the updated sheet (lean or populated as you prefer)
    return await ScoreSheet.findById(scoreSheet._id).lean();
  }

  /** Marks defence as ended
   * Computes average scores and updates Student.stageScores
   * Notifies students that scores are available
   */
  static async endDefence(defenceId: string) {
    const defence = await Defence.findById(defenceId);
    if (!defence) throw new Error("Defence not found");
    if (!defence.started) throw new Error("Defence has not started");
    if (defence.ended) throw new Error("Defence already ended");

    const sheet = await ScoreSheet.findOne({ defence: defenceId });
    if (!sheet) throw new Error("ScoreSheet not found");

    // === Compute averages ===
    const studentScores: Record<string, number[]> = {};

    for (const entry of sheet.entries) {
      const weightedTotal = entry.scores.reduce((sum, s) => {
        const crit = sheet.criteria.find((c) => c.name === s.criterion);
        if (!crit) return sum;
        return sum + (s.score * crit.weight) / 100;
      }, 0);

      if (!studentScores[entry.student.toString()]) {
        studentScores[entry.student.toString()] = [];
      }
      studentScores[entry.student.toString()].push(weightedTotal);
    }

    // === Update student.stageScores ===
    for (const [studentId, arr] of Object.entries(studentScores)) {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;

      const student = await Student.findById(studentId);
      if (!student) continue;

      let key: keyof typeof student.stageScores;

      if (defence.program === "MSC") {
        switch (defence.stage) {
          case STAGES.MSC.PROPOSAL:
            key = "proposal";
            break;
          case STAGES.MSC.INTERNAL:
            key = "internal";
            break;
          case STAGES.MSC.EXTERNAL:
            key = "external";
            break;
          default:
            throw new Error(`Unknown MSC defence stage: ${defence.stage}`);
        }
      } else if (defence.program === "PHD") {
        switch (defence.stage) {
          case STAGES.PHD.PROPOSAL_DEFENSE:
            key = "proposalDefense";
            break;
          case STAGES.PHD.SECOND_SEMINAR:
            key = "secondSeminar";
            break;
          case STAGES.PHD.INTERNAL_DEFENSE:
            key = "internalDefense";
            break;
          case STAGES.PHD.EXTERNAL_SEMINAR:
            key = "externalDefense";
            break;
          default:
            throw new Error(`Unknown PHD defence stage: ${defence.stage}`);
        }
      } else {
        throw new Error(`Unknown program: ${defence.program}`);
      }

      student.stageScores[key] = avg;
      await student.save();
    }

    // === Mark defence as ended ===
    defence.ended = true;
    await defence.save();

    return defence;
  }


  static async createDeptScoreSheet(criteria: { name: string; weight: number }[], userId: string) {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) throw new Error("Criteria weights must add up to 100");

    const lecturer = await Lecturer.findOne({ user: userId });
    if (!lecturer || !lecturer.department) {
      throw new Error("Lecturer not found or departeent not set");
    }

    const tempId = new mongoose.Types.ObjectId();


    const scoreSheet = await ScoreSheet.create({
      defence: tempId,
      department: lecturer.department,
      criteria,
      entries: [],
    });

    return scoreSheet;
  }


  static async UpdateCriterionDeptScoreSheet(
    userId: string,
    criterionId: string,
    update: { name?: string; weight?: number }
  ) {
    const lecturer = await Lecturer.findOne({ user: userId });
    if (!lecturer || !lecturer.department) {
      throw new Error("Lecturer not found or department not set");
    }

    const scoreSheet = await ScoreSheet.findOne({ department: lecturer.department });
    if (!scoreSheet) {
      throw new Error("ScoreSheet not found for department");
    }

    const criterion = scoreSheet.criteria.find((c: any) => c._id.toString() === criterionId);
    if (!criterion) {
      throw new Error("Criterion not found");
    }

    if (update.name !== undefined) criterion.name = update.name;
    if (update.weight !== undefined) criterion.weight = update.weight;

    // validate sum
    const totalWeight = scoreSheet.criteria.reduce((sum, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      throw new Error("Criteria weights must add up to 100");
    }

    await scoreSheet.save();
    return scoreSheet;
  }

  static async deleteCriterionDeptScoreSheet(userId: string, criterionId: string) {
    const lecturer = await Lecturer.findOne({ user: userId });
    if (!lecturer || !lecturer.department) {
      throw new Error("Lecturer not found or department not set");
    }

    const scoreSheet = await ScoreSheet.findOne({ department: lecturer.department });
    if (!scoreSheet) {
      throw new Error("ScoreSheet not found for department");
    }

    const criterionIndex = scoreSheet.criteria.findIndex((c: any) => c._id.toString() === criterionId);
    if (criterionIndex === -1) {
      throw new Error("Criterion not found");
    }

    scoreSheet.criteria.splice(criterionIndex, 1);

    // validate sum
    const totalWeight = scoreSheet.criteria.reduce((sum, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100 && scoreSheet.criteria.length > 0) {
      throw new Error("Criteria weights must add up to 100 after deletion");
    }

    await scoreSheet.save();
    return { success: true, deletedId: criterionId };
  }

  static async createGeneralScoreSheet(criteria: { name: string; weight: number }[]) {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) throw new Error("Criteria weights must add up to 100");

    const tempId = new mongoose.Types.ObjectId();


    const scoreSheet = await GeneralScoreSheet.create({
      defence: tempId,
      criteria,
      entries: [],
    });

    return scoreSheet;
  }


  static async updateGenCriterion(
    criterionId: string,
    update: { name?: string; weight?: number }
  ) {
    let scoreSheet = await GeneralScoreSheet.findOne();
    if (!scoreSheet) {
      throw new Error("General ScoreSheet not found");
    }

    const criterion = scoreSheet.criteria.find((c: any) => c._id.toString() === criterionId);
    if (!criterion) {
      throw new Error("Criterion not found");
    }

    if (update.name !== undefined) criterion.name = update.name;
    if (update.weight !== undefined) criterion.weight = update.weight;

    // validate sum
    const totalWeight = scoreSheet.criteria.reduce((sum, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      throw new Error("Criteria weights must add up to 100");
    }

    await scoreSheet.save();
    return criterion;
  }

 


  static async deleteGenCriterion(criterionId: string) {
    let scoreSheet = await GeneralScoreSheet.findOne();
    if (!scoreSheet) {
      throw new Error("General ScoreSheet not found");
    }

    const criterionIndex = scoreSheet.criteria.findIndex((c: any) => c._id.toString() === criterionId);
    if (criterionIndex === -1) {
      throw new Error("Criterion not found");
    }

    scoreSheet.criteria.splice(criterionIndex, 1);

    // validate sum
    const totalWeight = scoreSheet.criteria.reduce((sum, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100 && scoreSheet.criteria.length > 0) {
      throw new Error("Criteria weights must add up to 100 after deletion");
    }

    await scoreSheet.save();
    return { success: true, deletedId: criterionId };
  }





}
