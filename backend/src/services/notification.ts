import { Notification , Lecturer, IStudent} from "../models/index";
import {Types} from 'mongoose'


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

static async sendStudentDefenceNotifications (
  students: (IStudent & { user: { _id: Types.ObjectId } })[],
  stage: string,
  date: Date
) {
  const notifications = students.map((student) => ({
    recipient: student.user._id,
    role: 'student',
    message: `You have a ${stage} defence scheduled on ${date.toDateString()}`,
    read: false,
  }));

  await Notification.insertMany(notifications);
};

static async sendPanelDefenceNotifications (
  lecturerIds: Types.ObjectId[] | string[],
  stage: string,
  date: Date
) {
  const lecturers = await Lecturer.find({
    _id: { $in: lecturerIds },
  }).populate('user'); // populate lecturer.user

  const notifications = lecturers.map((lecturer) => ({
    recipient: lecturer.user._id, // this is the actual User ID
    role: 'panel-member',
    message: `You are assigned to a ${stage} defence panel on ${date.toDateString()}`,
    read: false,
  }));

  await Notification.insertMany(notifications);
};
}