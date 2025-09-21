import { Lecturer, User, Student } from '../models/index';
import { Role } from '../utils/permissions';


export default class LecturerService {
    static async getAllLecturers() {
        return Lecturer.find().populate("user");
    }
    static async editLecturer(lecturerId: string, updateData: object) {
        const updatedLecturer = await Lecturer.findByIdAndUpdate(
            lecturerId,
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedLecturer) {
            throw new Error("Lecturer not found");
        }
        return updatedLecturer;
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

    static async addDean(data: {
        email: string;
        title: string;
        firstName: string;
        lastName: string;
        userId: string;
        staffId: string;
        role: string;
        faculty: string;
    }) {

        //check if HOD has been added
        const existingDean = await Lecturer.findOne({
            department: data.faculty,
        }).populate({
            path: 'user',
            match: { roles: Role.DEAN },
        });

        if (existingDean && existingDean.user) {
            throw new Error(`A HOD has already been added for the ${data.faculty} Faculty.`);
        }

        const roles = [Role.DEAN, Role.GENERAL, Role.LECTURER];


        // Create User with dynamic roles
        const user = await User.create({
            email: data.email,
            password: data.email,
            roles,
            firstName: data.firstName,
            lastName: data.lastName,
        });

        return await Lecturer.create({
            user: user._id,
            title: data.title,
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

    static async addExternalExaminer(data: {
        email: string;
        title: string;
        firstName: string;
        lastName: string;
        role: string;
    }) {


        const roles = [Role.EXTERNAL_EXAMINER, Role.GENERAL, Role.LECTURER];

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
            staffId: 'none',
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

    static async getDeans() {
        return Lecturer.find()
            .populate({
                path: 'user',
                match: { roles: 'dean' }, // filters users whose roles include 'hod'
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

    static async getExternalExaminer() {
        return Lecturer.find()
            .populate({
                path: 'user',
                match: { roles: 'external_examiner' }, // filters users whose roles include 'provost'
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

    static async getLecturerByFaculty(userId: string) {
        const currentLecturer = await Lecturer.findOne({ user: userId });
        if (!currentLecturer || !currentLecturer.faculty) {
            throw new Error("Lecturer not found or faculty not set");
        }

        return Lecturer.find({ faculty: currentLecturer.faculty }).populate('user');
    }

    static async getLecturerById(userId: string) {
        const lecturer = await Lecturer.findOne({ user: userId }).populate("user");
        if (!lecturer) {
            throw new Error("Lecturer not found");
        }
        return lecturer;
    }

    static async assignFacultyRep(staffId: string) {
        const lecturer = await Lecturer.findById({ _id: staffId }).populate('user');
        if (!lecturer) {
            throw new Error('Lecturer not found');
        }

        // Get associated user
        const user = await User.findById(lecturer.user);
        if (!user) {
            throw new Error('User not found for this lecturer');
        }

        const rolesToAdd = [Role.PANEL_MEMBER, Role.FACULTY_PG_REP];

        // Ensure user.roles exists as an array
        if (!Array.isArray(user.roles)) {
            user.roles = [];
        }

        for (const role of rolesToAdd) {
            if (!user.roles.includes(role)) {
                user.roles.push(role);
            }
        }

        await user.save();
        return user;
    }


    static async getFacultyReps(userId: string) {
        // Get the lecturer making the request
        const lecturer = await Lecturer.findOne({ user: userId })
        if (!lecturer || !lecturer.department) {
            throw new Error("Lecturer not found or department not set");
        }


        const lecturers = await Lecturer.find({ department: lecturer.department })
            .populate({
                path: "user",
                match: { roles: Role.FACULTY_PG_REP },
                select: "firstName lastName email roles",
            }).lean();

        // Filter out lecturers without a user (failed match)
        const facultyReps = lecturers.filter(l => l.user);

        return facultyReps;

    }
static async getCollegeReps(department: string, level: string, stage: string) {
  const repNames = await Student.distinct("collegeRep", {
  department,
  level,
  currentStage: stage,
});

// Find lecturers, populate user
const lecturers = await Lecturer.find()
  .populate("user", "firstName lastName")
  .select("user staffId title department faculty");

// Filter only those lecturers whose formatted name matches a collegeRep name
const collegeReps = lecturers
  .map((lec) => {
    const user: any = lec.user;

    const name =
      user && typeof user === "object" && "firstName" in user && "lastName" in user
        ? `${lec.title} ${user.firstName} ${user.lastName}`
        : `${lec.title} Unknown Name`;

    return {
      lecturerId: lec._id,      // Lecturer doc ID
      name,
      staffId: lec.staffId,
      department: lec.department,
      faculty: lec.faculty,
    };
  })
  .filter((lec) => repNames.includes(lec.name)); // keep only reps

  return collegeReps
}






}





