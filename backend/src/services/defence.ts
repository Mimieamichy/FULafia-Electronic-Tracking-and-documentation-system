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
    panelMemberIds?: (string | Types.ObjectId)[];
  }) {
    const { stage, session, date, time, studentIds, panelMemberIds = [], program } = options;

    // Fetch students with projects
    const students = await Student.find({ _id: { $in: studentIds } })
      .populate("user", "firstName lastName")
      .lean();

    const projects = await Project.find({ student: { $in: studentIds } }).lean();

    //Department name (all students are from same department)
    const departmentName = students[0]?.department;
    const studentFaculty = students[0]?.faculty;
    if (!departmentName && !studentFaculty) {
      throw new Error("Department or Faculty not found for students");
    }

    // Collect supervisor/examiner/rep names
    const supervisorNames = new Set<string>();
    students.forEach((s) => {
      if (s.majorSupervisor) supervisorNames.add(s.majorSupervisor);
      if (s.minorSupervisor) supervisorNames.add(s.minorSupervisor);
      if (s.internalExaminer) supervisorNames.add(s.internalExaminer);
      if (s.collegeRep) supervisorNames.add(s.collegeRep);
    });

    // Find lecturers matching supervisor/examiner/rep names
    const lecturers = await Lecturer.find({ department: departmentName })
      .populate("user", "firstName lastName roles");


    const matchedLecturerIds: mongoose.Types.ObjectId[] = [];

    lecturers.forEach((lect) => {
      if (!lect.user) {
        console.warn(`Lecturer ${lect._id} has no user populated`);
        return;
      }

      const user = lect.user as any;
      const fullName = `${lect.title ?? ""} ${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

      if (supervisorNames.has(fullName)) {
        matchedLecturerIds.push(lect._id as mongoose.Types.ObjectId);
      }
    })

    const extraPanelMembers: mongoose.Types.ObjectId[] = [];
    const hod = await Lecturer.findOne({ department: departmentName })
      .populate({
        path: "user",
        match: { roles: "hod" }, // filter by role here
        select: "roles firstName lastName",
      });

    if (!hod || !hod.user) {
      throw new Error(`HOD not found for department: ${departmentName}`);
    }

    extraPanelMembers.push(hod._id as mongoose.Types.ObjectId);

    const dean = await Lecturer.findOne({ faculty: studentFaculty })
      .populate({
        path: "user",
        match: { roles: "dean" }, // filter by role here
        select: "roles firstName lastName",
      });

    if (!dean || !dean.user) {
      throw new Error(`DEAN not found for "${studentFaculty}".`);
    }

    extraPanelMembers.push(dean._id as mongoose.Types.ObjectId);

    const pgcord = await Lecturer.findOne({ department: departmentName })
      .populate({
        path: "user",
        match: { roles: "pgcord" }, // filter by role here
        select: "roles firstName lastName",
      });

    if (!pgcord || !pgcord.user) {
      throw new Error(`PG Coordinator not found for department: ${departmentName}`);
    }
    extraPanelMembers.push(pgcord._id as mongoose.Types.ObjectId);

    // Merge provided panelMemberIds with matched lecturerIds + role-based members
    const allPanelMembers = Array.from(
      new Set([
        ...panelMemberIds.map(String),
        ...matchedLecturerIds.map(String),
        ...extraPanelMembers.map(String),
      ])
    );

    // Create defence
    const defence = await Defence.create({
      stage,
      program,
      session,
      department: departmentName,
      date,
      time,
      students: studentIds,
      panelMembers: allPanelMembers,
      started: false,
      ended: false,
    });

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
      userIds: allPanelMembers,
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


static async getDefenceDetails(defenceId: string, panelMemberId: string) {
  // Ensure the panel member is actually assigned to this defence
  const defence = await Defence.findById(defenceId)
    .populate({
      path: "students",
      populate: { path: "user", select: "firstName lastName email" }
    })
    .populate("panelMembers", "firstName lastName roles email")
    .lean();

  if (!defence) throw new Error("Defence not found");

  if (!defence.panelMembers.some((m: any) => m._id.toString() === panelMemberId)) {
    throw new Error("You are not authorized to view this defence");
  }

  // Fetch projects
  const projects = await Project.find({
    student: { $in: defence.students.map((s: any) => s._id) }
  }).lean();

  // Fetch scoresheet (department based)
  const scoreSheet = await ScoreSheet.findOne({
    department: defence.department
  }).lean();

  return {
    defence,
    students: defence.students.map((s: any) => {
      const project = projects.find(p => p.student.toString() === s._id.toString());
      const latest = project?.versions?.[project.versions.length - 1];

      return {
        _id: s._id,
        matricNo: s.matricNo,
        name: `${s.user.firstName} ${s.user.lastName}`,
        projectTopic: latest?.topic ?? "No topic yet",
        latestFile: latest?.fileUrl ?? null
      };
    }),
    criteria: scoreSheet?.criteria ?? []
  };
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

      // Use only keys that exist in IStageScores
      type IStageScoresKeys = keyof typeof student.stageScores;
      let key: IStageScoresKeys;

      if (defence.program === "MSC") {
        switch (defence.stage) {
          case STAGES.MSC.PROPOSAL:
            key = "proposalScore" as IStageScoresKeys;
            break;
          case STAGES.MSC.INTERNAL:
            key = "internalScore" as IStageScoresKeys;
            break;
          case STAGES.MSC.EXTERNAL:
            key = "externalScore" as IStageScoresKeys;
            break;
          default:
            throw new Error(`Unknown MSC defence stage: ${defence.stage}`);
        }
      } else if (defence.program === "PHD") {
        switch (defence.stage) {
          case STAGES.PHD.PROPOSAL_DEFENSE:
            key = "proposalDefenseScore" as IStageScoresKeys;
            break;
          case STAGES.PHD.SECOND_SEMINAR:
            key = "secondSeminarScore" as IStageScoresKeys;
            break;
          case STAGES.PHD.INTERNAL_DEFENSE:
            key = "internalDefenseScore" as IStageScoresKeys;
            break;
          case STAGES.PHD.EXTERNAL_SEMINAR:
            key = "externalDefenseScore" as IStageScoresKeys;
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
      throw new Error("Lecturer not found or department = Lecturer.findById(userId) not set");
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

  static async getDeptScoreSheet(scoresheetId: string) {
    return await ScoreSheet.findById(scoresheetId)

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
    return criterionId;
  }



}
