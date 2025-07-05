import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  author: mongoose.Types.ObjectId;
  text: string;
  date: Date;
}

export interface IVersion {
  versionNumber: number;
  fileUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  comments: IComment[];
}

export interface IProject extends Document {
  student: mongoose.Types.ObjectId;
  stage: string; // e.g., 'proposal', 'defense', 'final submission'
  versions: IVersion[];
}

const commentSchema = new Schema<IComment>({
  author:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true },
  date:      { type: Date, default: Date.now },
}, { _id: false });

const versionSchema = new Schema<IVersion>({
  versionNumber: { type: Number, required: true },
  fileUrl:       { type: String, required: true },
  uploadedBy:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt:    { type: Date, default: Date.now },
  comments:      { type: [commentSchema], default: [] },
}, { _id: false });

const projectSchema = new Schema<IProject>({
  student:  { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  stage:    { type: String, required: true },
  versions: { type: [versionSchema], default: [] },
}, { timestamps: true });

// Optional helper: auto-increment versionNumber on push
projectSchema.methods.addVersion = async function(
  fileUrl: string,
  uploadedBy: mongoose.Types.ObjectId
) {
  const nextVersion = (this.versions.length > 0)
    ? this.versions[this.versions.length - 1].versionNumber + 1
    : 1;

  this.versions.push({
    versionNumber: nextVersion,
    fileUrl,
    uploadedBy,
    uploadedAt: new Date(),
    comments: []
  });

  return this.save();
};

export default mongoose.model<IProject>('Project', projectSchema);
// This model allows you to track multiple versions of a student's project,
// including who uploaded each version, when it was uploaded, and any comments made about it.