import { Student, IStudent } from "../models/index";


export default class StudentService {
    /**
     * Fetches all students from the database.
     * 
     * @returns {Promise<Student[]>} - A promise that resolves to an array of students.
     */
    static async getAllStudents() {
        return Student.find().populate('user').lean();
    }


    /**
     * Deletes a student by their ID.
     * 
     * @param {string} studentId - The ID of the student to delete.
     * @returns {Promise<Student | null>} - A promise that resolves to the deleted student or null if not found.
     */
    static async deleteStudent(studentId: string){
        return Student.findByIdAndDelete(studentId).lean();
    }
}