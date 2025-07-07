import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  author: mongoose.Types.ObjectId;
  text: string;
  date: Date;
}

export interface IVersion {
  versionNumber: number;
  fileUrl: string;
  topic: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  comments: IComment[];
}

export interface IProject extends Document {
  student: mongoose.Types.ObjectId;
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
  topic:         { type: String, required: true },
  uploadedBy:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt:    { type: Date, default: Date.now },
  comments:      { type: [commentSchema], default: [] },
}, { _id: false });

const projectSchema = new Schema<IProject>({
  student:  { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  versions: { type: [versionSchema], default: [] },
}, { timestamps: true });

// Optional helper: auto-increment versionNumber on push
projectSchema.methods.addVersion = function(
  fileUrl: string,
  topic: string,
  uploadedBy: mongoose.Types.ObjectId
) {
  const nextVersion = (this.versions.length > 0)
    ? this.versions[this.versions.length - 1].versionNumber + 1
    : 1;

  this.versions.push({
    versionNumber: nextVersion,
    fileUrl,
    topic,
    uploadedBy,
    uploadedAt: new Date(),
    comments: []
  });

  return this.save();
};



export default mongoose.model<IProject>('Project', projectSchema);
