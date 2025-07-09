import { Lecturer, User } from '../models/index';
import { Role } from '../utils/permissions';


export default class LecturerService {
    static async getAllLecturers() {
        return Lecturer.find().populate("user");
    }

    static async deleteLecturer(lecturerId: string) {
        const lecturer = Lecturer.findByIdAndDelete(lecturerId);
        if (!lecturer) {
            throw new Error("Lecturer not found");
        }
        return lecturer;
    }

    static async addLecturer(data: {
        email: string;
        title: string;
        firstName: string;
        lastName: string;
        department: string;
        faculty: string;
        staffId: string;
        role: string; // e.g. 'hod', 'lecturer', 'supervisor'
    }) {
        const normalizedRole = data.role.toLowerCase();

        // Validate and map string to enum
        const roleMap: Record<string, Role> = {
            hod: Role.HOD,
            lecturer: Role.LECTURER,
            supervisor: Role.SUPERVISOR,
            major_supervisor: Role.MAJOR_SUPERVISOR,
            panel_member: Role.PANEL_MEMBER,
            pgcord: Role.PGCOORD,
            dean: Role.DEAN,
            faculty_pg_rep: Role.FACULTY_PG_REP,
            internal_examiner: Role.INTERNAL_EXAMINER,
            provost: Role.PROVOST,
            external_examiner: Role.EXTERNAL_EXAMINER,
            admin: Role.ADMIN,
        };

        const resolvedRole = roleMap[normalizedRole];
        if (!resolvedRole) {
            throw new Error(`Invalid role: ${data.role}`);
        }

        const roles: Role[] = [resolvedRole, Role.GENERAL];

        // Create User with dynamic roles
        const user = await User.create({
            email: data.email,
            password: data.email, // for development; hash in pre-save
            roles,
            firstName: data.firstName,
            lastName: data.lastName,
        });

        return Lecturer.create({
            user: user._id,
            title: data.title,
            department: data.department,
            faculty: data.faculty,
            staffId: data.staffId,
        });
    }

    static async getLecturerById(lecturerId: string) {
        const lecturer = await Lecturer.findById(lecturerId).populate("user");
        if (!lecturer) {
            throw new Error("Lecturer not found");
        }
        return lecturer;
    }

    static async getHODs() {
        return Lecturer.find().populate("user");
    }
}



