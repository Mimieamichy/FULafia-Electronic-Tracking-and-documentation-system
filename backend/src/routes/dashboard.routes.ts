// src/routes/auth.ts
import { Router } from 'express';
import DashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth';


const router = Router();


router.use(authenticate);

router.get('/assigned-students', DashboardController.getAssignedStudents);
router.get('/upcoming-defences', DashboardController.getUpcomingDefences);
router.get('/count/notifications', DashboardController.getNotifications); // All authenticated users
router.get('/count/lecturers-dept', DashboardController.countLecturersInDept);
router.get('/count/lecturers-faculty', DashboardController.countLecturersInFaculty);
router.get('/count/students-dept', DashboardController.countStudentsInDept);
router.get('/count/students-faculty', DashboardController.countStudentsInFaculty);
router.get('/count/active-sessions', DashboardController.countActiveSessions);
router.get('/count/departments-faculty', DashboardController.countDepartmentsInFaculty);

export default router;