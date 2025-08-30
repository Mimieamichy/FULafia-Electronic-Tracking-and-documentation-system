import { Department } from '../models/index';
import { Types } from 'mongoose';

export default class DepartmentService {
  static async getAllDepartmentsForFaculty(facultyId: string) {
    // Validate the facultyId format
    if (!Types.ObjectId.isValid(facultyId)) {
      throw new Error('Invalid faculty ID.');
    }

    // Fetch departments belonging to the given faculty
    return Department.find({
      faculty: new Types.ObjectId(facultyId),
    }).populate('faculty');
  }
}
