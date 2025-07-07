import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '../utils/permissions';

export interface IUser extends Document {
  email: string;
  password: string;
  roles: string[];
  firstName: string;
  lastName: string;
  permissions?: string[];
  isPanelMember: Boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { type: [String], required: true, default: [Role.GENERAL] }, // Default role is 'GENERAL'
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isPanelMember: { type: Boolean, default: false },
  },
  { timestamps: true }
);



// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add comparePassword method
userSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
