// src/services/AuthService.ts
import { User, Student, Lecturer } from '../models/index';
import jwt from 'jsonwebtoken';
import EmailService from '../utils/helpers';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const RESET_TOKEN_EXPIRY = '1h';
import { getPermissionsFromRoles } from '../utils/helpers';
import { Role } from '../utils/permissions';


export default class AuthService {
  static async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    const roles = user.roles as Role[];
    const permissions = getPermissionsFromRoles(roles);

    // Defaults
    let department = "none"
    let faculty = "none"

    if (roles.includes(Role.STUDENT)) {
      const student = await Student.findOne({ user: user._id });
      if (!student) {
        throw new Error('Inconsistency: user has STUDENT role but no Student record found');
      }
      department = student.department;
      faculty = student.faculty;
    }

    if (roles.includes(Role.LECTURER)) {
      const lecturer = await Lecturer.findOne({ user: user._id });
      if (!lecturer) {
        throw new Error('Inconsistency: user has LECTURER role but no Lecturer record found');
      }
      department = lecturer.department || "none"
      faculty = lecturer.faculty || "none"
    }
    const token = jwt.sign(
      {
        id: user._id,
        roles,
        permissions,
        department,
        faculty,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        isPanelMember: user.isPanelMember,
        department,
        faculty,
      },
      token,
    };
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




}



