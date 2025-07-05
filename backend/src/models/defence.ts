import mongoose, { Document, Schema } from 'mongoose';

export interface IDefence extends Document {
  stage: string;                      // e.g. "proposal", "external"
  date: Date;
  started: boolean;
  ended: boolean;

  students: mongoose.Types.ObjectId[]; // one or many Student IDs
}

const defenceSchema = new Schema<IDefence>(
  {
    stage: { type: String, required: true },
    date: { type: Date, required: true },
    started: { type: Boolean, default: false },
    ended: { type: Boolean, default: false },

    // allow one or more students to defend together
    students: [
      { type: Schema.Types.ObjectId, ref: 'Student', required: true }
    ],
  },
  { timestamps: true }
);


export default mongoose.model<IDefence>('Defence', defenceSchema);
