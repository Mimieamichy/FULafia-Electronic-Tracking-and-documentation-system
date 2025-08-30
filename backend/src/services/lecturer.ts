import { Lecturer, User } from '../models/index';
import { Role } from '../utils/permissions';


export default class LecturerService {
    static async getAllLecturers() {
        return Lecturer.find().populate("user");
    }

    static async deleteLecturer(lecturerId: string) {
        const lecturer = await Lecturer.findByIdAndDelete(lecturerId);
        if (!lecturer) {
            throw new Error("Lecturer not found");
        }

        // Delete the associated user
        await User.findByIdAndDelete(lecturer.user);

        return lecturer;
    }


    static async addLecturer(data: {
        email: string;
        title: string;
        firstName: string;
        lastName: string;
        userId: string;
        staffId: string;
        role: string;
    }) {

        const normalizedRole = data.role.toLowerCase();

        // Validate and map string to enum
        const roleMap: Record<string, Role> = {
            lecturer: Role.LECTURER,
            supervisor: Role.SUPERVISOR,
            major_supervisor: Role.MAJOR_SUPERVISOR,
            panel_member: Role.PANEL_MEMBER,
            pgcord: Role.PGCOORD,
            dean: Role.DEAN,
            faculty_pg_rep: Role.FACULTY_PG_REP,
            internal_examiner: Role.INTERNAL_EXAMINER,
            external_examiner: Role.EXTERNAL_EXAMINER,
        };

        const resolvedRole = roleMap[normalizedRole];
        if (!resolvedRole) {
            throw new Error(`Invalid role: ${data.role}`);
        }

        const roles: Role[] = [resolvedRole, Role.GENERAL, Role.LECTURER];
        const lecturer = await LecturerService.getLecturerById(data.userId);


        // Get lecturer's department and faculty if no lecturer exists return null
        let faculty = lecturer?.faculty ?? "none";
        let department = lecturer?.department ?? "none";

        // Create User with dynamic roles
        const user = await User.create({
            email: data.email,
            password: data.email,
            roles,
            firstName: data.firstName,
            lastName: data.lastName,
        });

        return Lecturer.create({
            user: user._id,
            title: data.title,
            department,
            faculty,
            staffId: data.staffId,
        });
    }


    static async addHOD(data: {
        email: string;
        title: string;
        firstName: string;
        lastName: string;
        userId: string;
        staffId: string;
        role: string;
        department: string;
        faculty: string;
    }) {

        //check if HOD has been added
        const existingHOD = await Lecturer.findOne({
            department: data.department,
        }).populate({
            path: 'user',
            match: { roles: Role.HOD },
        });

        if (existingHOD && existingHOD.user) {
            throw new Error(`A HOD has already been added for the ${data.department} department.`);
        }

        const roles = [Role.HOD, Role.GENERAL, Role.LECTURER];


        // Create User with dynamic roles
        const user = await User.create({
            email: data.email,
            password: data.email, // for development; hash in pre-save
            roles,
            firstName: data.firstName,
            lastName: data.lastName,
        });

        return await Lecturer.create({
            user: user._id,
            title: data.title,
            department: data.department,
            faculty: data.faculty,
            staffId: data.staffId,
        });
    }

    static async addProvost(data: {
        email: string;
        title: string;
        firstName: string;
        lastName: string;
        staffId: string;
        role: string;
    }) {


        const roles = [Role.PROVOST, Role.GENERAL, Role.LECTURER];

        // Create User with dynamic roles
        const user = await User.create({
            email: data.email,
            password: data.email, // for development; hash in pre-save
            roles,
            firstName: data.firstName,
            lastName: data.lastName,
        });

        return await Lecturer.create({
            user: user._id,
            title: data.title,
            department: 'none',
            faculty: 'none',
            staffId: data.staffId,
        });
    }

    static async getHODs() {
        return Lecturer.find()
            .populate({
                path: 'user',
                match: { roles: 'hod' }, // filters users whose roles include 'hod'
            })
            .then(lecturers => lecturers.filter(l => l.user)); // remove lecturers with no matched user
    }


    static async getProvost() {
        return Lecturer.find()
            .populate({
                path: 'user',
                match: { roles: 'provost' }, // filters users whose roles include 'provost'
            })
            .then(lecturers => lecturers.filter(l => l.user)); // remove lecturers with no matched user
    }

    static async getLecturerByDepartment(userId: string) {
        const currentLecturer = await Lecturer.findOne({ user: userId });
        if (!currentLecturer || !currentLecturer.department) {
            throw new Error("Lecturer not found or department not set");
        }

        return Lecturer.find({ department: currentLecturer.department }).populate('user');
    }

    static async getLecturerById(userId: string) {
        const lecturer = await Lecturer.findOne({ user: userId }).populate("user");
        if (!lecturer) {
            throw new Error("Lecturer not found");
        }
        return lecturer;
    }


    


}





