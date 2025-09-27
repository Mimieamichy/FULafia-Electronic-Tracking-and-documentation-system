// src/routes/project.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import upload  from '../middlewares/upload';
import ProjectController from '../controllers/projectController';
import { Permission } from '../utils/permissions';

const router = Router();

router.get('/:userId', authenticate, checkPermission(Permission.DOWNLOAD_PROJECT), ProjectController.getStudentProjects);
router.post('/upload', authenticate, checkPermission(Permission.UPLOAD_PROJECT), upload.single('project'), ProjectController.uploadProject);
router.post('/uploadCorrected', authenticate, checkPermission(Permission.UPLOAD_PROJECT), upload.single('project'), ProjectController.supervisorUploadCorrection);
router.get('/comments/:studentId/:versionNumber', authenticate, checkPermission(Permission.VIEW_COMMENTS), ProjectController.viewComments);
router.get('/download/:studentId/:versionNumber', authenticate, checkPermission(Permission.DOWNLOAD_PROJECT), ProjectController.downloadProject);
router.get('/download/:studentId', authenticate, checkPermission(Permission.DOWNLOAD_PROJECT), ProjectController.downloadLatestProject);
router.post('/comment/:studentId/:versionNumber', authenticate, checkPermission(Permission.COMMENT), ProjectController.commentOnProject);
router.post('/approve/:studentId', authenticate, checkPermission(Permission.APPROVE_STUDENT_PROJECT), ProjectController.approveProject);




export default router;
 