import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // User ID
  role: string; // e.g. 'hod', 'lecturer', etc.
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', notificationSchema);
