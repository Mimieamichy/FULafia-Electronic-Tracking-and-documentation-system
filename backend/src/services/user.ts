import { User, Lecturer, Student } from "../models/index";
import bcrypt from "bcryptjs";

export default class UserService {
    static async getUserProfile(userId: string) {
        const user = await User.findById(userId).lean();
        if (!user) throw new Error('User not found');

        const profile: any = { user };

        if ((user.role).includes('lecturer')) {
            const lecturer = await Lecturer.findOne({ user: user._id }).lean();
            if (lecturer) profile.lecturer = lecturer;
        } else if ((user.role).includes('student')) {
            const student = await Student.findOne({ user: user._id }).lean();
            if (student) profile.student = student;
        }

        return profile;
    }

    static async updatePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error('Old password is incorrect');

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;

        await user.save();
        return;
    }
}