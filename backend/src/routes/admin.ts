import { Router } from 'express';
import LecturerController from '../controllers/lecturer';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { validateBody } from '../middlewares/validations';
import { Permission } from '../utils/permissions';
import Joi from 'joi';

const router = Router();

// ✅ Validation Schema for HOD creation
const addHodSchema = Joi.object({
  email: Joi.string().email().required(),
  title: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  department: Joi.string().required(),
  faculty: Joi.string().required(),
  staffId: Joi.string().required()
});

// ✅ Routes with authentication and permissions
router.get('/lecturers', authenticate, checkPermission(Permission.VIEW_ALL_LECTURERS), LecturerController.getAllLecturers);
router.delete('/lecturers/:id', authenticate, checkPermission(Permission.DELETE_LECTURER), LecturerController.deleteLecturer);
router.post('/lecturers/add-lecturer', authenticate, checkPermission(Permission.ADD_HOD), validateBody(addHodSchema), LecturerController.addLecturer);
router.get('/lecturers/get-hods', authenticate, checkPermission(Permission.GET_HODS), LecturerController.getHODs);

router.get('/activity-logs', authenticate, checkPermission(Permission.VIEW_ACTIVITY_LOGS), AdminController.getActivityLogs);

export default router;
