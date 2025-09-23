import mongoose, { Document, Schema } from 'mongoose';

export interface IStageScores {
  // PHD stages
  firstSeminarScore?: number;
  secondSeminarScore?: number;
  thirdSeminarScore?: number;
  externalDefenseScore?: number;

  // MSC stages
  proposalScore?: number;
  internalScore?: number;
  externalScore?: number;
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
  collegeRep?: mongoose.Types.ObjectId;
  projectTopic?: string;
  stageScores: IStageScores;
  createdAt?: Date;
  updatedAt?: Date;
}

const stageScoresSchema = new Schema<IStageScores>(
  {},
  { _id: false, strict: true }
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
    majorSupervisor: { type: Schema.Types.ObjectId, ref: 'Lecturer', default: null },
    minorSupervisor: { type: Schema.Types.ObjectId, ref: 'Lecturer', default:  null},
    internalExaminer: { type: Schema.Types.ObjectId, ref: 'Lecturer', default: null },
    collegeRep: { type: Schema.Types.ObjectId, ref: 'Lecturer', default: null },
    projectTopic: { type: String, default: '' },
    stageScores: { type: stageScoresSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', studentSchema);
