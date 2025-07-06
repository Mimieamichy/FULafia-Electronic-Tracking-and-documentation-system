import { Student, IStudent } from "../models/index";

export default class StudentService {
    static async addStudent(studentData: IStudent) {
        const student = new Student(studentData);
        return await student.save();
    }

    static async getAllStudents() {
        return await Student.find().populate('user').lean();
    }

    static async deleteStudent(studentId: string) {
        return await Student.findByIdAndDelete(studentId); // no .lean() needed here
    }

    static async getAllStudentsInFaculty(faculty: string) {
        return await Student.find({ faculty })
            .populate('user')
            .lean();
    }

    static async getAllStudentsInDepartment(department: string) {
        return await Student.find({ department })
            .populate('user')
            .lean();
    }

}
