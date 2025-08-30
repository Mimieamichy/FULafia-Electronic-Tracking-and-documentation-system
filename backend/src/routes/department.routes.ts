// src/routes/faculty.ts
import { Router } from 'express';
import DepartmentController from '../controllers/department.controller';
import { authenticate } from '../middlewares/auth';


const router = Router();


// Get department by faculty
router.get(
  '/:facultyId',
  authenticate,
  DepartmentController.getAllDepartmentsForFaculty
);

export default router;
