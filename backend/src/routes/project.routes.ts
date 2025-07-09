// src/routes/project.routes.ts
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { upload } from '../middlewares/upload';
import ProjectController from '../controllers/project';
import { Permission } from '../utils/permissions';

const router = Router();

router.post('/upload', authenticate, checkPermission(Permission.UPLOAD_PROJECT), upload.single('file'), ProjectController.uploadProjectVersion);
router.get('/projects', authenticate, checkPermission(Permission.VIEW_ALL_PROJECTS), ProjectController.getAllProjects);

export default router;
