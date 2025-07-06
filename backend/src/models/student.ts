import mongoose, { Document, Schema } from 'mongoose';

export interface IStageScores {
  firstSeminar?: number;
  secondSeminar?: number;
  thirdSeminar?: number;
  externalDefense?: number;
}

export interface IStudent extends Document {
  user: mongoose.Types.ObjectId;
  matricNo: string;
  level: 'msc' | 'phd';
  currentStage: string;
  department: string;
  faculty: string;
  session: mongoose.Types.ObjectId;
  majorSupervisor?: mongoose.Types.ObjectId;
  minorSupervisor?: mongoose.Types.ObjectId;
  internalExaminer?: mongoose.Types.ObjectId;
  projectTopic?: string;
  stageScores: IStageScores;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

const stageScoresSchema = new Schema<IStageScores>(
  {
    firstSeminar: { type: Number, min: 0, max: 100, default: 0 },
    secondSeminar: { type: Number, min: 0, max: 100, default: 0 },
    thirdSeminar: { type: Number, min: 0, max: 100, default: 0 },
    externalDefense: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false }
);

const studentSchema = new Schema<IStudent>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    matricNo: { type: String, required: true, unique: true },
    level: { type: String, enum: ['msc', 'phd'], required: true },
    currentStage: { type: String, default: 'start' },
    department: { type: String, required: true },
    faculty: { type: String, required: true },
    session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    majorSupervisor: { type: Schema.Types.ObjectId, ref: 'Lecturer' },
    minorSupervisor: { type: Schema.Types.ObjectId, ref: 'Lecturer' },
    internalExaminer: { type: Schema.Types.ObjectId, ref: 'Lecturer' },
    projectTopic: { type: String, default: '' },
    stageScores: { type: stageScoresSchema, default: () => ({}) },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', studentSchema);
