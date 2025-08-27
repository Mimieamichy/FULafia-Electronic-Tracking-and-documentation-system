import { Notification, Lecturer, Student } from "../models/index";
import { Types } from 'mongoose'


export default class NotificationService {
  static async getNotifications(userId: string) {
    try {
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .lean();

      return notifications;
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${(error as Error).message}`);
    }
  }
  static async createNotifications(options: {
    userIds?: (Types.ObjectId | string)[];    // direct userIds
    lecturerIds?: (Types.ObjectId | string)[]; // resolve via Lecturer.user
    studentIds?: (Types.ObjectId | string)[];  // resolve via Student.user
    role: string;
    message: string;
  }) {
    let recipients: { userId: Types.ObjectId; role: string }[] = [];

    // Case 1: direct userIds provided
    if (options.userIds && options.userIds.length > 0) {
      recipients.push(
        ...options.userIds.map((id) => ({
          userId: new Types.ObjectId(id),
          role: options.role,
        }))
      );
    }

    // Case 2: lecturerIds provided → resolve to users
    if (options.lecturerIds && options.lecturerIds.length > 0) {
      const lecturers = await Lecturer.find({ _id: { $in: options.lecturerIds } }).populate('user');
      recipients.push(
        ...lecturers.map((lec: any) => ({
          userId: lec.user._id,
          role: options.role,
        }))
      );
    }

    // Case 3: studentIds provided → resolve to users
    if (options.studentIds && options.studentIds.length > 0) {
      const students = await Student.find({ _id: { $in: options.studentIds } }).populate('user');
      recipients.push(
        ...students.map((stud: any) => ({
          userId: stud.user._id,
          role: options.role,
        }))
      );
    }

    // Build notifications
    const notifications = recipients.map((r) => ({
      recipient: r.userId,
      role: r.role,
      message: options.message,
      read: false,
    }));

    if (notifications.length === 0) return [];

    return Notification.insertMany(notifications);
  }
}

