import { Defence, Student, Project, ScoreSheet, Lecturer, User } from '../models/index';
import { Types } from 'mongoose';
import NotificationService from "../services/notification";
import { STAGES } from "../utils/constants";
import { IStageScores } from '../models/student';
import { Role } from '../utils/permissions';


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

    // 1. Fetch students and their projects
    const students = await Student.find({ _id: { $in: studentIds } }).lean();

    if (students.length === 0) {
      throw new Error("No students found for the provided IDs.");
    }

    // 2. Collect all associated lecturers IDs from student documents
    const allStudentLecturers: Set<Types.ObjectId | string> = new Set();
    students.forEach((s) => {
      if (s.majorSupervisor) allStudentLecturers.add(s.majorSupervisor.toString());
      if (s.minorSupervisor) allStudentLecturers.add(s.minorSupervisor.toString());
      if (s.internalExaminer) allStudentLecturers.add(s.internalExaminer.toString());
      if (s.collegeRep) allStudentLecturers.add(s.collegeRep.toString());
    });

    // 3. Department and faculty info (assuming all students are from the same one)
    const departmentName = students[0]?.department;
    const studentFaculty = students[0]?.faculty;
    if (!departmentName && !studentFaculty) {
      throw new Error("Department or Faculty not found for students");
    }

    // 4. Find role-based panel members (HOD, Dean, PGCord)
    const extraPanelMembers: string[] = [];

    const hod = await Lecturer.findOne({ department: departmentName }).populate({ path: "user", match: { roles: "hod" }, select: "roles" });

    if (hod) {
      extraPanelMembers.push((hod._id as Types.ObjectId | string).toString())
    } else {
      throw new Error(`HOD not found for department: ${departmentName}`)
    }

    const dean = await Lecturer.findOne({ faculty: studentFaculty }).populate({ path: "user", match: { roles: "dean" }, select: "roles" });
    if (dean) {
      extraPanelMembers.push((dean._id as Types.ObjectId | string).toString());
    } else {
      throw new Error(`DEAN not found for "${studentFaculty}".`);
    }

    const pgcord = await Lecturer.findOne({ department: departmentName }).populate({
      path: "user",
      match: { roles: "pgcord" },
      select: "roles",
    });
    if (pgcord) {
      extraPanelMembers.push((pgcord._id as Types.ObjectId | string).toString());
    } else {
      throw new Error(`PG Coordinator not found for department: ${departmentName}`);
    }

    // 5. Merge all unique IDs into a single Set
    const allPanelMembers = new Set<string>();

    panelMemberIds.forEach((id) => allPanelMembers.add(id.toString()));
    allStudentLecturers.forEach((id) => allPanelMembers.add(id.toString()));
    extraPanelMembers.forEach((id) => allPanelMembers.add(id));

    const finalPanelMemberIds = Array.from(allPanelMembers);

    // 6. Check if panel member role has been added to panel members else add it 
    if (finalPanelMemberIds.length > 0) {
      // Fetch all lecturers who will be panel members and populate their user data
      const panelLecturers = await Lecturer.find({
        _id: { $in: finalPanelMemberIds }
      }).populate('user');

      // Update users who don't have the PANEL_MEMBER role
      const updatePromises = panelLecturers
        .filter(lecturer =>
          lecturer.user &&
          typeof lecturer.user === 'object' &&
          Array.isArray((lecturer.user as any).roles) &&
          !(lecturer.user as any).roles.includes(Role.PANEL_MEMBER)
        )
        .map(lecturer => {
          (lecturer.user as any).roles.push(Role.PANEL_MEMBER);
          return (lecturer.user as any).save();
        });

      // Wait for all role updates to complete
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log(`Added PANEL_MEMBER role to ${updatePromises.length} users`);
      }
    }

    // Create defence
    const defence = await Defence.create({
      stage,
      program,
      session,
      department: departmentName,
      date,
      time,
      students: studentIds,
      panelMembers: finalPanelMemberIds,
      started: false,
      ended: false,
    });

    // Simplified message without student details
    const message = `You have been assigned to be part of the panel members for ${stage} defence scheduled on ${date.toDateString()}, Time: ${time}, Department: ${departmentName}, Program: ${program}`;

    await NotificationService.createNotifications({
      lecturerIds: finalPanelMemberIds,
      role: "panel",
      message,
    });

    return defence; // Return only defence, not details
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

    const message = `The ${defence.stage} defence has started. You may now score and comment on students' project.`;

    await NotificationService.createNotifications({
      lecturerIds: defence.panelMembers,
      role: "panel members",
      message,
    });


    return defence;
  }

  /**
  * Get a defence
  * Get associated student details (and projects)
  * Ensure the requesting panel member is authorized
  */
  static async getDefenceDetails(defenceId: string, panelMemberId: string) {
    const lecturer = await Lecturer.findOne({ user: panelMemberId });
    if (!lecturer) throw new Error("Lecturer profile not found");

    panelMemberId = (lecturer._id as Types.ObjectId).toString();
    // Ensure the panel member is actually assigned to this defence
    const defence = await Defence.findById(defenceId)
      .populate({
        path: "students",
        populate: { path: "user", select: "firstName lastName email" }
      })
      .populate("panelMembers", "firstName lastName roles email")
      .lean();

    if (!defence) throw new Error("Defence not found");


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
      criteria: scoreSheet ? scoreSheet : []
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

    // === Stage → IStageScores key map ===
    const MSC_STAGE_MAP: Record<string, keyof IStageScores> = {
      [STAGES.MSC.PROPOSAL]: "proposalScore",
      [STAGES.MSC.INTERNAL]: "internalScore",
      [STAGES.MSC.EXTERNAL]: "externalScore",
    };

    const PHD_STAGE_MAP: Record<string, keyof IStageScores> = {
      [STAGES.PHD.PROPOSAL_DEFENSE]: "firstSeminarScore",
      [STAGES.PHD.SECOND_SEMINAR]: "secondSeminarScore",
      [STAGES.PHD.INTERNAL_DEFENSE]: "thirdSeminarScore",
      [STAGES.PHD.EXTERNAL_SEMINAR]: "externalDefenseScore",
    };

    // === Update student.stageScores ===
    for (const [studentId, arr] of Object.entries(studentScores)) {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;

      const student = await Student.findById(studentId);
      if (!student) continue;

      let key: keyof IStageScores;

      if (defence.program === "MSC") {
        key = MSC_STAGE_MAP[defence.stage];
        if (!key) throw new Error(`Unknown MSC defence stage: ${defence.stage}`);
      } else if (defence.program === "PHD") {
        key = PHD_STAGE_MAP[defence.stage];
        if (!key) throw new Error(`Unknown PHD defence stage: ${defence.stage}`);
      } else {
        throw new Error(`Unknown program: ${defence.program}`);
      }

      student.stageScores[key] = avg;
      await student.save();
    }

    // === Mark defence as ended ===
    defence.ended = true;
    await defence.save();

    return defence
  }

  /**Finds students and move student to next stage in the proram type  */
  static async approveStudentDefence(studentId: string) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    const defence = await Defence.findOne({ students: studentId, ended: true });
    if (!defence) throw new Error("No ended defence found for this student");

    const stage = defence.stage;
    const program = defence.program;

    if (program === "MSC") {
      switch (stage) {
        case STAGES.MSC.PROPOSAL:
          student.currentStage = STAGES.MSC.INTERNAL;
          break;
        case STAGES.MSC.INTERNAL:
          student.currentStage = STAGES.MSC.EXTERNAL;
          break;
        case STAGES.MSC.EXTERNAL:
          student.currentStage = STAGES.MSC.COMPLETED;
          break;
        default:
          throw new Error(`Invalid stage for MSC student: ${stage}`);
      }
    } else if (program === "PHD") {
      switch (stage) {
        case STAGES.PHD.PROPOSAL_DEFENSE:
          student.currentStage = STAGES.PHD.SECOND_SEMINAR;
          break;
        case STAGES.PHD.SECOND_SEMINAR:
          student.currentStage = STAGES.PHD.INTERNAL_DEFENSE;
          break;
        case STAGES.PHD.INTERNAL_DEFENSE:
          student.currentStage = STAGES.PHD.EXTERNAL_SEMINAR;
          break;
        case STAGES.PHD.EXTERNAL_SEMINAR:
          student.currentStage = STAGES.PHD.COMPLETED;
          break;
        default:
          throw new Error(`Invalid stage for PHD student: ${stage}`);
      }
    } else {
      throw new Error(`Unknown program: ${program}`);
    }

    await student.save();

    const message = `Your project has been approved, you can proceed to prepare for next stage.`;

    await NotificationService.createNotifications({
      studentIds: [studentId],
      role: "student",
      message,
    });

    return student;
  }


  /**Rejects a student’s defence and keeps them in the same stage */
  static async rejectStudentDefence(studentId: string) {
    const student = await Student.findById(studentId);
    if (!student) throw new Error("Student not found");

    const defence = await Defence.findOne({ students: studentId, ended: true });
    if (!defence) throw new Error("No ended defence found for this student");

    const message = `Your project was not approved, you need to rejoin defence for ${student.currentStage}.`;

    await NotificationService.createNotifications({
      studentIds: [studentId],
      role: "student",
      message,
    });


    return { student, defence };
  }


  static async getDefenceForPanelMember(program: string, userId: string) {
    const lecturer = await Lecturer.findOne({ user: userId });
    if (!lecturer) throw new Error("Lecturer profile not found");
    const lecturerIds = lecturer._id;
    
    const department = lecturer.department;

    const defence = await Defence.find({ 
        program, 
        department,
        panelMembers: lecturerIds, 
        ended: false,
    })
    .select('_id department')
   

    if (!defence) {
        throw new Error(`No ${program} defences found for your department where you are a panel member`);
    }

    return defence;
}




}
