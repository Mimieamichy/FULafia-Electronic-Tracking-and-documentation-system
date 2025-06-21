import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  matricNo: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
}

export type UserRole =
  | 'student'
  | 'hod'
  | 'pgcord'
  | 'lecturer'
  | 'dean'
  | 'faculty_pg_rep'
  | 'internal_examiner'
  | 'external_examiner'
  | 'provost'
  | 'admin';

const userSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  matricNo:    { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'hod', 'pgcord', 'lecturer', 'dean', 'faculty_pg_rep', 'internal_examiner', 'external_examiner', 'provost', 'admin'],
    required: true,
  },
  permissions: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
