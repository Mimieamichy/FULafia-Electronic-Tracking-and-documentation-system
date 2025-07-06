import { Session, ISession } from "../models/index";


export default class SessionService {
    static async createSession(sessionData: ISession) {
        const session = new Session(sessionData);
        return await session.save();
    }

    static async getAllSessions() {
        return await Session.find();
    }

    static async getSessionByDepartment() {
        return await Session.find();
    }


    static async getSessionByFaculty() {
        return await Session.find();
    }


}