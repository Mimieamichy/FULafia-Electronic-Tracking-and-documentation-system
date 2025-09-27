import { Schema, model, Types, Document } from "mongoose";

const defenceCommentSchema = new Schema(
  {
    defence: {
      type: Types.ObjectId,
      ref: "Defence",
      required: true,
    },
    student: {
      type: Types.ObjectId,
      ref: "Student",
      required: true,
    },
    comments: [
      {
        author: {
          type: Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Ensure one defenceId + studentId record only
defenceCommentSchema.index({ defenceId: 1, studentId: 1 }, { unique: true });

export interface IComment {
  author: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IDefenceComment extends Document {
  defence: Types.ObjectId;
  student: Types.ObjectId;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

export default model<IDefenceComment>("DefenceComment", defenceCommentSchema);
