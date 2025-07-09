import { Session, Lecturer } from "../models/index";


export default class SessionService {
    static async createSession(sessionData: any) {
        // Fetch the lecturer record with populated user inf
        const lecturer = await Lecturer.findOne({ user: sessionData.userId }).populate("user");

        if (!lecturer) {
            throw new Error("Lecturer not found");
        }

        const session = await Session.create({
            sessionName: sessionData.sessionName,
            department: lecturer.department,
            faculty: lecturer.faculty,
            isActive: true,
            startDate: sessionData.startDate,
            endDate: sessionData.endDate,
        });
        return session
    }

    static async getAllSessions() {
        return await Session.find();
    }

    static async getSessionByDepartment(userId: string) {
        const lecturer = await Lecturer.findOne({ user: userId });

        if (!lecturer) throw new Error("Lecturer not found");

        return await Session.find({ department: lecturer.department });
    }

    static async getSessionByFaculty(userId: string) {
        const lecturer = await Lecturer.findOne({ user: userId });

        if (!lecturer) throw new Error("Lecturer not found");

        return await Session.find({ faculty: lecturer.faculty });
    }


}