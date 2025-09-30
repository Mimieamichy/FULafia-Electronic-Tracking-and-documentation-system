import { ActivityLog } from '../models/index';


export default class ActivityLogService {
    static async getAllLogs() {
        const logs = await ActivityLog.find()
            .populate("actor", "firstName lastName email") // include actor details
            .sort({ timestamp: -1 });

        return logs.map(log => {
            const actor = log.actor as any;
            const name = `${actor?.firstName || ''} ${actor?.lastName || ''}`.trim();
            const time = log.timestamp

            return {
                message: `${name} ${log.action} ${log.entity} on ${time}`,
                actor: {
                    name,
                    email: actor?.email,
                },
                time
            };
        });
    }



    static async logActivity(userId: string, name: string, role: string, action: string, entity: string) {
        await ActivityLog.create({
            actor: userId,
            name,
            role,
            action,
            entity,
            timestamp: new Date(),
        });
    }

}
