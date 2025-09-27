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

// full schema with all possible fields
const stageScoresSchema = new Schema<IStageScores>(
  {
    // PHD stages
    firstSeminarScore: { type: Number, min: 0, max: 100, default: 0 },
    secondSeminarScore: { type: Number, min: 0, max: 100, default: 0 },
    thirdSeminarScore: { type: Number, min: 0, max: 100, default: 0 },
    externalDefenseScore: { type: Number, min: 0, max: 100, default: 0 },

    // MSC stages
    proposalScore: { type: Number, min: 0, max: 100, default: 0 },
    internalScore: { type: Number, min: 0, max: 100, default: 0 },
    externalScore: { type: Number, min: 0, max: 100, default: 0 },
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
    majorSupervisor: { type: Schema.Types.ObjectId, ref: 'Lecturer', default: null },
    minorSupervisor: { type: Schema.Types.ObjectId, ref: 'Lecturer', default: null },
    internalExaminer: { type: Schema.Types.ObjectId, ref: 'Lecturer', default: null },
    collegeRep: { type: Schema.Types.ObjectId, ref: 'Lecturer', default: null },
    projectTopic: { type: String, default: '' },
    stageScores: { type: stageScoresSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// 🟢 Pre-validate hook: remove irrelevant scores
studentSchema.pre<IStudent>('validate', function (next) {
  if (this.level === 'msc') {
    // Keep only MSc fields
    this.stageScores = {
      proposalScore: this.stageScores?.proposalScore ?? 0,
      internalScore: this.stageScores?.internalScore ?? 0,
      externalScore: this.stageScores?.externalScore ?? 0,
    };
  } else if (this.level === 'phd') {
    // Keep only PhD fields
    this.stageScores = {
      firstSeminarScore: this.stageScores?.firstSeminarScore ?? 0,
      secondSeminarScore: this.stageScores?.secondSeminarScore ?? 0,
      thirdSeminarScore: this.stageScores?.thirdSeminarScore ?? 0,
      externalDefenseScore: this.stageScores?.externalDefenseScore ?? 0,
    };
  }
  next();
});

export default mongoose.model<IStudent>('Student', studentSchema);
