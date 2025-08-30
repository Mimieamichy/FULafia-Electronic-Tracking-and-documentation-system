import { Faculty } from '../models/index';
import { Types } from 'mongoose';

export default class FacultyService {
  static async getFacultyById(facultyId: string) {
    // Validate the facultyId format
    if (!Types.ObjectId.isValid(facultyId)) {
      throw new Error('Invalid faculty ID.');
    }

    // Fetch faculty by ID
    return Faculty.findById(new Types.ObjectId(facultyId));
  }

  static async getAllFaculties() {
    return Faculty.find();
  }
}
