import mongoose, { Document, Schema } from 'mongoose';

export interface IDefence extends Document {
  stage: string;                      // e.g. "proposal", "external"
  session: string;                   // e.g. "2024/2025"
  date: Date;
  started: boolean;
  ended: boolean;

  students: mongoose.Types.ObjectId[];       // Student IDs
  panelMembers: mongoose.Types.ObjectId[];   // User IDs (panel members)
}

const defenceSchema = new Schema<IDefence>(
  {
    stage: { type: String, required: true },
    session: { type: String, required: true }, // Add session info
    date: { type: Date, required: true },
    started: { type: Boolean, default: false },
    ended: { type: Boolean, default: false },

    students: [
      { type: Schema.Types.ObjectId, ref: 'Student', required: true }
    ],

    panelMembers: [
      { type: Schema.Types.ObjectId, ref: 'User', required: true }
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IDefence>('Defence', defenceSchema);
