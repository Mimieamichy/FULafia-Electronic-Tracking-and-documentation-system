import { Student, User, Lecturer, Project, IUser } from "../models/index";
import { Role } from '../utils/permissions';
import LecturerService from "../services/lecturer"
import { paginateWithCache } from "../utils/paginatedCache"
import NotificationService from "./notification";
import { Types } from "mongoose";



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
        firstName: string;
        lastName: string;
        projectTopic: string;
    }>) {
        // 1. Find the student to get the associated user's ID
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }

        if (!student.user) {
            throw new Error('Associated user ID is missing for this student');
        }

        const { firstName, lastName, matricNo, projectTopic } = updateData;

        const studentUpdates: Partial<{ matricNo?: string; projectTopic?: string }> = {};
        if (matricNo !== undefined) studentUpdates.matricNo = matricNo;
        if (projectTopic !== undefined) studentUpdates.projectTopic = projectTopic;

        const userUpdates: Partial<{ firstName?: string; lastName?: string }> = {};
        if (firstName !== undefined) userUpdates.firstName = firstName;
        if (lastName !== undefined) userUpdates.lastName = lastName;
        const updatePromises = [];

        // Add update promise only if there's data for it
        if (Object.keys(studentUpdates).length > 0) {
            updatePromises.push(
                Student.findByIdAndUpdate(studentId, studentUpdates)
            );
        }

        if (Object.keys(userUpdates).length > 0) {
            updatePromises.push(
                User.findByIdAndUpdate(student.user, userUpdates)
            );
        }

        //Execute all updates
        await Promise.all(updatePromises);
        const updatedStudent = await Student.findById(studentId).populate('user');
        return updatedStudent;
    }

    static async deleteStudent(studentId: string) {
        const student = await Student.findById(studentId);

        if (!student) {
            throw new Error('Student not found');
        }

        const [deletedUser, deletedStudent] = await Promise.all([
            User.findByIdAndDelete(student.user),
            Student.findByIdAndDelete(studentId)
        ]);

        return { deletedUser, deletedStudent };
    }

    static async getAllMscStudentsInDepartment(
        department: string,
        userId: string,
        session: Types.ObjectId,
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
            { department, level, session },
            "user"
        );
    }


    static async getAllMscStudentsInFaculty(
        faculty: string,
        userId: string,
        session: Types.ObjectId,
        page = 1,
        limit = 10
    ) {
        if (!faculty || faculty.trim() === '') {
            const lecturer = await LecturerService.getLecturerById(userId);
            // If lecturer not found, default to "none"
            faculty = lecturer?.faculty ?? 'none';
        }
        const level = "msc"

        // Use pagination + cache utility
        return paginateWithCache(
            Student,
            page,
            limit,
            `students:faculty=${faculty}`,
            120, // cache TTL in seconds
            { faculty, level, session },
            "user"
        );
    }

    static async getAllPhdStudentsInDepartment(
        department: string,
        userId: string,
        session: Types.ObjectId,
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
            { department, level, session },
            "user"
        );
    }


    static async getAllPhdStudentsInFaculty(
        faculty: string,
        userId: string,
        session: Types.ObjectId,
        page = 1,
        limit = 10
    ) {
        if (!faculty || faculty.trim() === '') {
            const lecturer = await LecturerService.getLecturerById(userId);
            // If lecturer not found, default to "none"
            faculty = lecturer?.faculty ?? 'none';
        }
        const level = "phd"

        // Use pagination + cache utility
        return paginateWithCache(
            Student,
            page,
            limit,
            `students:faculty=${faculty}`,
            120, // cache TTL in seconds
            { faculty, level, session },
            "user"
        );
    }


    static async getStudentsBySupervisorMsc(userId: string) {
        const lecturer = await Lecturer.findOne({ user: userId }).populate('user');
        if (!lecturer) throw new Error('Lecturer not found');

        const user = lecturer.user as any;
        const supervisorName = `${lecturer.title} ${user.firstName} ${user.lastName}`.trim();
        const level = 'msc'

        const students = await Student.find({
            $or: [
                { majorSupervisor: supervisorName },
                { minorSupervisor: supervisorName }
            ],
            level: level,
        }).populate('user');

        const results = await Promise.all(
            students.map(async (student) => {
                const project = await Project.findOne({ student: student._id })
                    .populate('versions.uploadedBy', 'firstName lastName email')
                    .populate('versions.comments.author', 'firstName lastName email');

                if (!project) {
                    // Instead of throwing, return student with null project
                    return { student, project: null };
                }

                project.versions.forEach((version) => {
                    version.comments.forEach((comment: any) => {
                        const author = comment.author as any;
                        if (author) {
                            comment.set(
                                'authorName',
                                `${author.firstName} ${author.lastName}`,
                                { strict: false }
                            );
                        }
                    });
                });

                return { student, project };
            })
        );


        return results;
    }


    static async getStudentsBySupervisorPhd(userId: string) {
        const lecturer = await Lecturer.findOne({ user: userId }).populate('user');
        if (!lecturer) throw new Error('Lecturer not found');

        const user = lecturer.user as any;
        const supervisorName = `${lecturer.title} ${user.firstName} ${user.lastName}`.trim();
        const level = 'phd'

        const students = await Student.find({
            $or: [
                { majorSupervisor: supervisorName },
                { minorSupervisor: supervisorName }
            ],
            level: level,
        }).populate('user');

        const results = await Promise.all(
            students.map(async (student) => {
                const project = await Project.findOne({ student: student._id })
                    .populate('versions.uploadedBy', 'firstName lastName email')
                    .populate('versions.comments.author', 'firstName lastName email');

                if (!project) {
                    // Instead of throwing, return student with null project
                    return { student, project: null };
                }

                project.versions.forEach((version) => {
                    version.comments.forEach((comment: any) => {
                        const author = comment.author as any;
                        if (author) {
                            comment.set(
                                'authorName',
                                `${author.firstName} ${author.lastName}`,
                                { strict: false }
                            );
                        }
                    });
                });

                return { student, project };
            })
        );

        return results;
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
        const lecturer = await Lecturer.findById(staffId);
        if (!lecturer) throw new Error('Lecturer not found');

        const userId = lecturer.user;
        const user = await User.findById(userId);
        if (user) {
            for (const role of roleToAdd) {
                if (user.roles.includes("hod") || user.roles.includes("pgcord")) {
                    // HOD or PG CORD → only remove (they already have privilege)
                    await User.updateOne(
                        { _id: userId },
                        { $pull: { roles: role } }
                    );
                } else {
                    // Normal user → ensure uniqueness (remove first, then add)
                    await User.updateOne(
                        { _id: userId },
                        { $pull: { roles: role } }
                    );

                    await User.updateOne(
                        { _id: userId },
                        { $push: { roles: { $each: [role], $position: 0 } } }
                    );
                }
            }
        }
        // Send notifications in parallel to avoid lag
        await Promise.all([
            NotificationService.createNotifications({
                lecturerIds: [staffId],
                role: roleToAdd[0] || 'supervisor',
                message: `${staffName} has been assigned as ${type.replace(/_/g, ' ')} for student with matric Number ${student.matricNo}.`
            }),
            NotificationService.createNotifications({
                studentIds: [String(student._id)],
                role: 'student',
                message: `${staffName} has been assigned as your ${type.replace(/_/g, ' ')}.`
            })
        ]);

        return student;
    }

    static async assignCollegeRep(staffId: string, studentId: string) {
        // Find the lecturer by staffId
        const lecturer = await Lecturer.findOne({ _id: staffId }).populate('user');
        if (!lecturer) {
            throw new Error('Lecturer not found');
        }

        // Find associated user (populated)
        const user = lecturer.user as any
        // Check if the lecturer is already a college rep
        if (user?.roles?.includes('college_rep')) {
            throw new Error('This lecturer is already a college representative');
        }
        // Update the user roles to include 'college_rep'
        const updatedLecturer = await User.findByIdAndUpdate(
            user._id,
            { $addToSet: { roles: 'college_rep' } }, // Use $addToSet to avoid duplicates
            { new: true }
        );

        //update the student collection to set the collegeRep field
        const updatedStudent = await Student.findOneAndUpdate(
            { _id: studentId },
            { $set: { collegeRep: `${lecturer.title ?? ''} ${user.firstName} ${user.lastName}`.trim() } },
            { new: true }
        );

        return { updatedStudent, updatedLecturer };
    }



}
