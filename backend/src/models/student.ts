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
  majorSupervisor?: string;
  minorSupervisor?: string;
  internalExaminer?: string;
  collegeRep?: string;
  projectTopic?: string;
  stageScores: IStageScores;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

const stageScoresSchema = new Schema<IStageScores>(
  {},
  { _id: false, strict: false }
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
    majorSupervisor: { type: String, default: '' },
    minorSupervisor: { type: String, default:  ''},
    internalExaminer: { type: String, default: '' },
    collegeRep: { type: String, default: '' },
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
