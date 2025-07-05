// src/services/ActivityLogService.ts
import { ActivityLog, User } from '../models/index';

export default class ActivityLogService {
    /**
     * Records an activity with a human‑friendly message.
     *
     * @param userId    – Mongo ID of the actor
     * @param role      – actor’s role (e.g. 'hod')
     * @param department – actor’s department (optional)
     * @param action    – verb (e.g. 'approved')
     * @param target    – what was acted upon (e.g. "student's project")
     */
    static async record(
        userId: string,
        role: string,
        department: string | undefined,
        action: string,
        target: string
    ) {
        // Load user name for the message
        const user = await User.findById(userId);
        const name = user ? `${user.firstName} ${user.lastName}` : 'Someone';

        // Build the sentence
        const deptText = department ? ` from the ${department} department` : '';
        const timeStamp = new Date().toLocaleString('en-GB', {
            timeZone: 'Africa/Lagos',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

        const message = `${name}, an ${role.toUpperCase()}${deptText} ${action} ${target} on ${timeStamp}`;

        // Save to DB
        return ActivityLog.create({
            user: userId,
            role,
            department,
            action,
            target,
            message,
        });
    }

    /** Fetch history for a user or globally, newest first */
    static async getHistory(limit = 50) {
        return ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }
}
