import { Lecturer, User } from '../models/index';
import bcrypt from 'bcryptjs';


export default class LecturerService {
    static async getAllLecturers() {
        return Lecturer.find().populate('user');
    }

    static async deleteLecturer(lecturerId: string) {
        const lecturer = Lecturer.findByIdAndDelete(lecturerId);
        if (!lecturer) {
            throw new Error('Lecturer not found');
        }
        return lecturer
    }

    static async addHOD(data: {
        email: string;
        title: string;
        firstName: string;
        lastName: string;
        department: string;
        faculty: string;
        staffId: string;
    }) {
        
        // create a User with role HOD, then Lecturer record
        const user = await User.create({
            email: data.email,
            password: data.email, // Use email as password for simplicity
            role: 'hod',
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


}



