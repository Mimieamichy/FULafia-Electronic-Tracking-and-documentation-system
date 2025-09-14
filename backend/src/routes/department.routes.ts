// src/routes/faculty.ts
import { Router } from 'express';
import DepartmentController from '../controllers/department.controller';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { Permission } from '../utils/permissions';


const router = Router();


// Get department by faculty
router.get('/:facultyId', authenticate, checkPermission(Permission.VIEW_FACULTY_LECTURERS), DepartmentController.getAllDepartmentsForFaculty);
router.get('/', authenticate, checkPermission(Permission.VIEW_FACULTY_LECTURERS), DepartmentController.getAllUserDepartments);

export default router;
