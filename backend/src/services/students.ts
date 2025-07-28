import { Student, User } from "../models/index";
import { Role } from '../utils/permissions';
import LecturerService from "../services/lecturer"



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
            stageScores: getDefaultStageScores(data.level)
        });

        return await student.save();
    }


    static async deleteStudent(studentId: string) {
        return await Student.findByIdAndDelete(studentId);
    }

    static async getAllStudentsInDepartment(department: string, userId: string) {
        if (department == '') {
            const lecturer = await LecturerService.getLecturerById(userId);
            // Get lecturer's department and faculty if no lecturer exists return null
            department = lecturer?.department ?? "none";
        }
        return await Student.find({ department })
            .populate('user')
            .lean();
    }

    static async assignSupervisor(staffId: string, type: string, matricNo: string) {
        const updateField =
            type === 'major'
                ? { majorSupervisor: staffId }
                : type === 'minor'
                    ? { minorSupervisor: staffId }
                    : type === 'internal_examiner'
                        ? { internalExaminer: staffId }
                        : {};

        const student = await Student.findOneAndUpdate(
            { matricNo },
            { $set: updateField },
            { new: true }
        );

        if (!student) {
            throw new Error('Student not found');
        }

        // Determine role to add
        let roleToAdd = 'SUPERVISOR';
        if (type === 'major') roleToAdd = 'MAJOR_SUPERVISOR', 'SUPERVISOR';
        if (type === 'internal_examiner') roleToAdd = 'INTERNAL_EXAMINER';

        // Update lecturer role
        await User.updateOne(
            { staffId },
            { $addToSet: { role: roleToAdd } } // prevents duplicates
        );

        return student;
    }
}
