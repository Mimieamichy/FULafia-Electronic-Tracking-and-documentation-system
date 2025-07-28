import mongoose, { Schema, model, Types } from 'mongoose';

const commentSchema = new Schema(
  {
    author: { type: Types.ObjectId, ref: 'User', required: true },
    text:   { type: String, required: true },
    date:   { type: Date, default: Date.now },
  },
  { _id: false }
);

const versionSchema = new Schema(
  {
    versionNumber: { type: Number, required: true },
    fileUrl:       { type: String, required: true },
    topic:         { type: String, required: true },
    uploadedBy:    { type: Types.ObjectId, ref: 'User', required: true },
    uploadedAt:    { type: Date, default: Date.now },
    comments:      { type: [commentSchema], default: [] },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    student:  { type: Types.ObjectId, ref: 'Student', required: true },
    versions: { type: [versionSchema], default: [] },
  },
  { timestamps: true }
);

// Helper method to add a new version
projectSchema.methods.addVersion = function (
  fileUrl: string,
  topic: string,
  uploadedBy: Types.ObjectId
) {
  const nextVersion = this.versions.length
    ? this.versions[this.versions.length - 1].versionNumber + 1
    : 1;

  this.versions.push({
    versionNumber: nextVersion,
    fileUrl,
    topic,
    uploadedBy,
    uploadedAt: new Date(),
    comments: [],
  });

  return this.save();
};

export type IComment = typeof commentSchema extends Schema<infer T> ? T : never;
export type IVersion = typeof versionSchema extends Schema<infer T> ? T : never;
export type IProject = mongoose.Document & {
  student: Types.ObjectId;
  versions: IVersion[];
  addVersion: (
    fileUrl: string,
    topic: string,
    uploadedBy: Types.ObjectId
  ) => Promise<IProject>;
};

export default model<IProject>('Project', projectSchema);
