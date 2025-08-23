// src/routes/auth.ts
import { Router } from 'express';
import StudentController from '../controllers/studentController';
import { validateBody } from '../middlewares/validations';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { Permission } from '../utils/permissions';
import Joi from 'joi';

const router = Router();

// Schemas\```json
export const addStudentSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(), 
  lastName: Joi.string().required(), 
  matNo: Joi.string().required(),
  degree: Joi.string().valid('msc', 'phd').required(), 
  session: Joi.string().required(),
});


export const addSupervisorSchema = Joi.object({
  staffId: Joi.string().required(),
  type: Joi.string().valid('major', 'minor', 'internal_examiner').required(), 
  matNo: Joi.string().required(),
})

// Routes
router.post('/add', validateBody(addStudentSchema), authenticate, checkPermission(Permission.ADD_STUDENTS),StudentController.addStudent);
router.get('msc/:department', authenticate, checkPermission(Permission.VIEW_ALL_STUDENTS), StudentController.getAllMscStudentsByDepartment);
router.get('phd/:department', authenticate, checkPermission(Permission.VIEW_ALL_STUDENTS), StudentController.getAllPhdStudentsByDepartment);
router.post('/assignSupervisor', validateBody(addStudentSchema), authenticate, checkPermission(Permission.ASSIGN_SUPERVISORS), StudentController.assignSupervisor);




export default router;
