// src/services/AuthService.ts
import { User, Notification } from '../models/index';
import jwt from 'jsonwebtoken';
import EmailService from '../utils/helpers';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const RESET_TOKEN_EXPIRY = '1h';

export default class AuthService {
  static async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { user, token };
  }

  static async logout(_userId: string) {
    // No-op for JWT; client should drop token.
    return;
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('No account with that email found');
    }

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRY });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await EmailService.sendPasswordReset(email, resetUrl);
    return;
  }

  static async resetPassword(token: string, newPassword: string) {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(payload.id);
    if (!user) {
      throw new Error('Invalid token');
    }
    user.password = newPassword;
    await user.save();
    return;
  }

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



