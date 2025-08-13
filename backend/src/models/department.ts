import mongoose, { Document, Schema, Types } from 'mongoose';
import {Faculty} from './index';

export interface IDepartment extends Document {
  name: string;
  facultyId: Types.ObjectId;
  faculty: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const departmentSchema = new Schema<IDepartment>({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  facultyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Faculty',
    required: true,
    validate: {
      validator: async function(value: Types.ObjectId) {
        const faculty = await Faculty.findById(value);
        return faculty !== null;
      },
      message: 'Faculty does not exist'
    }
  },
  faculty: { 
    type: String, 
    required: true 
  },
}, { 
  timestamps: true 
});

// Compound index to ensure unique department names within a faculty
departmentSchema.index({ name: 1, faculty: 1 }, { unique: true });

// Update facultyName if referenced faculty changes
departmentSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.facultyId) {
    const faculty = await Faculty.findById(doc.facultyId);
    if (faculty && doc.facultyName !== faculty.name) {
      doc.facultyName = faculty.name;
      await doc.save();
    }
  }
});


export default mongoose.model<IDepartment>('Department', departmentSchema);