import mongoose, { Document, Schema } from 'mongoose';

export interface ILecturer extends Document {
  user: mongoose.Types.ObjectId;
  staffId: string;
  title?: string;
  department?: string;
  faculty?: string;
}

const lecturerSchema = new Schema<ILecturer>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  staffId: { type: String, required: true},
  title: { type: String, required: false },
  department: { type: String, required: false },
  faculty: { type: String, required: false }
}, { timestamps: true });

export default mongoose.model<ILecturer>('Lecturer', lecturerSchema);
