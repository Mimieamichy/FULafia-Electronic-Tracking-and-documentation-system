import { Student, User, Lecturer } from "../models/index";
import { Role } from '../utils/permissions';
import LecturerService from "../services/lecturer"
import { paginateWithCache } from "../utils/paginatedCache"
import NotificationService from "./notification";



export function getDefaultStageScores(level: 'msc' | 'phd') {
    if (level === 'phd') {
        return {
            firstSeminar: 0,
            secondSeminar: 0,
            thirdSeminar: 0,
            externalDefense: 0,
        };
    } else {
        return {
            proposalDefense: 0,
            internalDefense: 0,
            externalDefense: 0,
        };
    }
}


export default class StudentService {
    static async addStudent(data: {
        email: string;
        firstName: string;
        lastName: string;
        matricNo: string;
        level: 'msc' | 'phd';
        userId: string;
        session: string;
        projectTopic: string;
    }) {
        // Step 1: Check if student with matricNo or email already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const existingStudent = await Student.findOne({ matricNo: data.matricNo });
        if (existingStudent) {
            throw new Error('Student with this matric number already exists');
        }

        // Step 2: Create the user
        const user = await User.create({
            email: data.email,
            password: data.email, // You can hash this in a pre-save hook
            firstName: data.firstName,
            lastName: data.lastName,
            roles: [Role.STUDENT, Role.GENERAL]
        });

        // Step 3: Get departement and faculty from user

        const lecturer = await LecturerService.getLecturerById(data.userId);


        // Get lecturer's department and faculty if no lecturer exists return null
        let faculty = lecturer?.faculty ?? "none";
        let department = lecturer?.department ?? "none";

        // Step 4: Create the student
        const student = new Student({
            user: user._id,
            matricNo: data.matricNo,
            level: data.level,
            department,
            faculty,
            session: data.session,
            projectTopic: data.projectTopic,
            stageScores: getDefaultStageScores(data.level)
        });

        return await student.save();
    }

    static async editStudent(studentId: string, updateData: Partial<{
        matricNo: string;
        firstName:  string;
        lastName: string;
        projectTopic: string
    }>) {
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }   
        const updatedStudent = await Student.findByIdAndUpdate(studentId, updateData, { new: true });
        return updatedStudent;
    }

    static async deleteStudent(studentId: string) {
        return await Student.findByIdAndDelete(studentId);
    }

    static async getAllMscStudentsInDepartment(
        department: string,
        userId: string,
        page = 1,
        limit = 10
    ) {
        if (!department || department.trim() === '') {
            const lecturer = await LecturerService.getLecturerById(userId);
            // If lecturer not found, default to "none"
            department = lecturer?.department ?? 'none';
        }
        const level = "msc"

        // Use pagination + cache utility
        return paginateWithCache(
            Student,
            page,
            limit,
            `students:dept=${department}`,
            120, // cache TTL in seconds
            { department, level },
            "user"
        );
    }

    static async getAllPhdStudentsInDepartment(
        department: string,
        userId: string,
        page = 1,
        limit = 10
    ) {
        if (!department || department.trim() === '') {
            const lecturer = await LecturerService.getLecturerById(userId);
            // If lecturer not found, default to "none"
            department = lecturer?.department ?? 'none';
        }

        const level = "phd"

        // Use pagination + cache utility
        return paginateWithCache(
            Student,
            page,
            limit,
            `students:dept=${department}`,
            120, // cache TTL in seconds
            { department, level },
            "user"
        );
    }

    
    static async getStudentsBySupervisor(userId: string) {
  const lecturer = await Lecturer.findOne({ user: userId }).populate('user');
  if (!lecturer) throw new Error('Lecturer not found');

  const user = lecturer.user as any;
  const supervisorName = `${lecturer.title} ${user.firstName} ${user.lastName}`.trim();

  return Student.find({
    $or: [
      { majorSupervisor: supervisorName },
      { minorSupervisor: supervisorName }
    ]
  });
}
    static async assignSupervisor(
    staffId: string,
    staffName: string,
    type: string,
    matricNo: string
) {
    // Decide field to update
    const updateField =
        type === 'major'
            ? { majorSupervisor: staffName }
            : type === 'minor'
            ? { minorSupervisor: staffName }
            : type === 'internal_examiner'
            ? { internalExaminer: staffName }
            : {};

    // Update student
    const student = await Student.findOneAndUpdate(
        { matricNo },
        { $set: updateField },
        { new: true }
    );
    if (!student) throw new Error('Student not found');

    // Roles to add
    let roleToAdd: string[] = [];
    if (type === 'major') roleToAdd = ['major_supervisor', 'supervisor'];
    else if (type === 'minor') roleToAdd = ['supervisor'];
    else if (type === 'internal_examiner') roleToAdd = ['internal_examiner'];

    // Get lecturer
    const lecturer = await Lecturer.findOne({ _id: staffId });
    if (!lecturer) throw new Error('Lecturer not found');

    const userId = lecturer.user;

    for (const role of roleToAdd) {
  // Check if user has hod or pgcord
  const user = await User.findById(userId);

  if (!user) continue;

  if (user.roles.includes("hod") || user.roles.includes("pgcord")) {
    //If user is HOD or PG CORD → remove role only
    await User.updateOne(
      { _id: userId },
      { $pull: { roles: role } }
    );
  } else {
    //Normal users → ensure uniqueness and add at beginning
    await User.updateOne(
      { _id: userId },
      { $pull: { roles: role } } // remove if exists to avoid dup
    );

    await User.updateOne(
      { _id: userId },
      { $push: { roles: { $each: [role], $position: 0 } } }
    );
  }
}


    // Notifications
    await NotificationService.createNotifications({
        lecturerIds: [staffId],
        role: roleToAdd[0] || 'supervisor',
        message: `${staffName} has been assigned as ${type.replace(/_/g, ' ')} for student with matric Number ${student.matricNo}.`
    });

    await NotificationService.createNotifications({
        studentIds: [String(student._id)],
        role: 'student',
        message: `${staffName} has been assigned as your ${type.replace(/_/g, ' ')}.`
    });

    return student;
}


}
