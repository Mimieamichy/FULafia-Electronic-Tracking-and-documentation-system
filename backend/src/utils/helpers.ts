import nodemailer from 'nodemailer';
import { ROLE_PERMISSIONS, Role, Permission } from '../utils/permissions';

export default class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail', 
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  /**
   * Send a generic email
   * @param to recipient email address
   * @param subject email subject line
   * @param html HTML content of the email
   */
  static async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: `ETDS Fulfia System <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };
    await EmailService.transporter.sendMail(mailOptions);
  }

  /**
   * Send password reset instructions
   * @param to recipient email
   * @param resetUrl link for resetting password
   */
  static async sendPasswordReset(to: string, resetUrl: string) {
    const html = `
      <p>Hi,</p>
      <p>You requested a password reset. Click <a href="${resetUrl}">here</a> to set a new password.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Thanks,<br/>ETDS Fulafia Team</p>
    `;
    await this.sendMail(to, 'Password Reset Request', html);
  }


}


export function getPermissionsFromRoles(roles: Role[]): Permission[] {
  const all = roles.flatMap(role => ROLE_PERMISSIONS[role] || []);
  return Array.from(new Set(all)); // Remove duplicates
}


