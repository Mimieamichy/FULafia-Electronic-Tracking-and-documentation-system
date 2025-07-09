import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  sessionName: string;
  department: string;
  faculty: string; 
  isActive: boolean;
  startDate: Date;
  endDate: Date;
}



const sessionSchema = new Schema<ISession>({
  sessionName: { type: String, required: true },
  department: { type: String, required: true },
  faculty: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<ISession>('Session', sessionSchema);
