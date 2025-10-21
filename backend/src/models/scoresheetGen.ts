import mongoose, { Document, Schema } from 'mongoose';

/**
 * Represents a single score on a specific criterion by a panel member
 */
export interface ICriterionScore {
  criterion: string; // now references criterion._id
  score: number; // 0-100
}

/**
 * Represents a single student's scores across multiple criteria by a panel member
 */
export interface IScoreEntry {
  student: mongoose.Types.ObjectId;
  panelMember: mongoose.Types.ObjectId;
  defence: mongoose.Types.ObjectId;
  scores: ICriterionScore[];
}

/**
 * ScoreSheet is tied to a Defence.
 * Holds criteria definitions and panel scoring entries.
 */
export interface IGeneralScoreSheet extends Document {

  criteria: {
    _id: mongoose.Types.ObjectId; // each criterion has its own id
    name: string;
    weight: number; // percentage weight, sum = 100
  }[];
  entries: IScoreEntry[];
}

// ✅ Each criterion now has an ObjectId (_id)
const criterionSchema = new Schema<{ name: string; weight: number }>(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: true } // give each criterion its own id
);

// ✅ scores now reference criterion by its id
const criterionScoreSchema = new Schema<ICriterionScore>(
  {
    criterion: { type: String, required: true }, // reference criterion._id
    score: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const scoreEntrySchema = new Schema<IScoreEntry>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    panelMember: { type: Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    defence: { type: Schema.Types.ObjectId, ref: 'Defence', required: false, unique: true },
    scores: {
      type: [criterionScoreSchema],
      validate: {
        validator: (arr: ICriterionScore[]) => {
          const crits = arr.map((s) => s.criterion.toString());
          return new Set(crits).size === crits.length;
        },
        message: 'Duplicate criteria in scores are not allowed',
      },
    },
  },
  { _id: false }
);

const generalScoreSheetSchema = new Schema<IGeneralScoreSheet>(
  {
    criteria: {
      type: [criterionSchema],
      validate: [
        {
          validator: (arr: { name: string; weight: number }[]) => {
            const names = arr.map((c) => c.name);
            if (new Set(names).size !== names.length) return false;
            const total = arr.reduce((sum, c) => sum + c.weight, 0);
            return total === 100;
          },
          message: 'Criteria must have unique names and weights summing to 100',
        },
      ],
    },
    entries: [scoreEntrySchema],
  },
  { timestamps: true }
);

export default mongoose.model<IGeneralScoreSheet>('GeneralScoreSheet', generalScoreSheetSchema);
