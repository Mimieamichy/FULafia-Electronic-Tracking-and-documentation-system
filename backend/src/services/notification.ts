import { Notification } from "../models/index";


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
}