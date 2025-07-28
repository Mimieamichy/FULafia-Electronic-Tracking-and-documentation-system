// src/routes/project.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import upload  from '../middlewares/upload';
import ProjectController from '../controllers/projectController';
import { Permission } from '../utils/permissions';

const router = Router();

router.post('/upload', authenticate, checkPermission(Permission.UPLOAD_PROJECT), upload.single('project'), ProjectController.uploadProject);
router.post('/uploadCorrected', authenticate, checkPermission(Permission.UPLOAD_PROJECT), upload.single('project'), ProjectController.supervisorUploadCorrection);
router.get('/comments', authenticate, checkPermission(Permission.VIEW_COMMENTS), ProjectController.viewComments);
router.get('/download/:studentId', authenticate, checkPermission(Permission.DOWNLOAD_PROJECT), ProjectController.downloadProject);
router.post('/comment', authenticate, checkPermission(Permission.COMMENT), ProjectController.commentOnProject);

export default router;
