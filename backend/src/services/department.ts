import { Department , Lecturer, Faculty} from '../models/index';
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

static async getAllUserDepartments(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  // Find the lecturer
  const lecturer = await Lecturer.findOne({ user: userId });
  if (!lecturer) {
    throw new Error("Lecturer not found for this user.");
  }

  if (!lecturer.faculty) {
    throw new Error("No faculty assigned to this lecturer.");
  }

  // Find the Faculty document using the faculty name stored in Lecturer
 const faculty = await Faculty.findOne({
  $or: [
    { name: lecturer.faculty }, // e.g. "College of Medicine"
    { name: `Faculty of ${lecturer.faculty}` }, // e.g. "Faculty of Engineering"
    { name: `${lecturer.faculty}` }, 
  ]
});

  if (!faculty) {
    throw new Error(`Faculty of '${lecturer.faculty}' not found.`);
  }

  console.log("Found faculty:", faculty);
  // Find all departments under this facultyId
  return Department.find({
    faculty: faculty._id,
  }).populate("facultyId"); // populate full Faculty document if you need it
}

}
