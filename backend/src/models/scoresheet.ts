import mongoose, { Document, Schema } from 'mongoose';

/**
 * Represents a single score on a specific criterion by a panel member
 */
export interface ICriterionScore {
  criterion: string;
  score: number; // 0-100
}

/**
 * Represents a single student's scores across multiple criteria by a panel member
 */
export interface IScoreEntry {
  student: mongoose.Types.ObjectId;
  panelMember: mongoose.Types.ObjectId;
  scores: ICriterionScore[];
}

/**
 * ScoreSheet holds criteria definitions (names and weights) and entries of scored students
 */
export interface IScoreSheet extends Document {
  defence: mongoose.Types.ObjectId;     // reference to Defence session
  criteria: {
    name: string;
    weight: number; // percentage weight, sum of all weights must equal 100
  }[];
  entries: IScoreEntry[];
}

const criterionSchema = new Schema<{
  name: string;
  weight: number;
}>(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const criterionScoreSchema = new Schema<ICriterionScore>(
  {
    criterion: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const scoreEntrySchema = new Schema<IScoreEntry>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    panelMember: { type: Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    scores: {
      type: [criterionScoreSchema],
      validate: {
        validator: (arr: ICriterionScore[]) => {
          const crits = arr.map(s => s.criterion);
          return new Set(crits).size === crits.length;
        },
        message: 'Duplicate criteria in scores are not allowed',
      }
    }
  },
  { _id: false }
);

const scoreSheetSchema = new Schema<IScoreSheet>(
  {
    defence: { type: Schema.Types.ObjectId, ref: 'Defence', required: true },
    criteria: {
      type: [criterionSchema],
      validate: [
        {
          validator: (arr: { name: string; weight: number }[]) => {
            // unique names
            const names = arr.map(c => c.name);
            if (new Set(names).size !== names.length) return false;
            // sum to 100
            const total = arr.reduce((sum, c) => sum + c.weight, 0);
            return total === 100;
          },
          message: 'Criteria must have unique names and weights summing to 100'
        }
      ]
    },
    entries: [scoreEntrySchema],
  },
  { timestamps: true }
);

// Ensure each panelMember scores a student only once per defence
scoreSheetSchema.index({ defence: 1, 'entries.student': 1, 'entries.panelMember': 1 }, { unique: true });

export default mongoose.model<IScoreSheet>('ScoreSheet', scoreSheetSchema);
