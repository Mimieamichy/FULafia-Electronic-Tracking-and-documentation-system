// src/models/ActivityLog.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;      // ref User
  role: string;                       // e.g. 'hod'
  department?: string;                // e.g. 'History'
  action: string;                     // e.g. 'approved'
  target: string;                     // e.g. "student's project"
  message: string;                    // full sentence
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role:       { type: String, required: true },
    department: { type: String }, 
    action:     { type: String, required: true },
    target:     { type: String, required: true },
    message:    { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ createdAt: -1 }); 

export default mongoose.model<IActivityLog>(
  'ActivityLog',
  activityLogSchema
);
