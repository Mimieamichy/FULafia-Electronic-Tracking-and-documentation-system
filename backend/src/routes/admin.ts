import { Router } from 'express';
import AdminController from '../controllers/role-based/admin';
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
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  department: Joi.string().required(),
  faculty: Joi.string().required(),
  staffId: Joi.string().required()
});

// ✅ Routes with authentication and permissions
router.get('/lecturers', authenticate, checkPermission(Permission.VIEW_ALL_LECTURERS), AdminController.getAllLecturers);
router.delete('/lecturers/:id', authenticate, checkPermission(Permission.DELETE_LECTURER), AdminController.deleteLecturer);
router.post('/lecturers/add-hod', authenticate, checkPermission(Permission.ADD_HOD), validateBody(addHodSchema), AdminController.addHOD);

router.get('/sessions', authenticate, checkPermission(Permission.VIEW_ALL_SESSIONS), AdminController.getAllSessions);
router.get('/projects', authenticate, checkPermission(Permission.VIEW_ALL_PROJECTS), AdminController.getAllProjects);
router.get('/activity-logs', authenticate, checkPermission(Permission.VIEW_ACTIVITY_LOGS), AdminController.getActivityLogs);

export default router;
