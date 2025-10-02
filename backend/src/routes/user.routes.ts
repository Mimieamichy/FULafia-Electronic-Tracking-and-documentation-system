import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { Permission } from '../utils/permissions';


const router = Router();



router.get('/profile', authenticate, UserController.getUserProfile);
router.put('/update-password', authenticate, UserController.updatePassword);
router.get('/activity-logs', authenticate, checkPermission(Permission.VIEW_ACTIVITY_LOGS), UserController.getAllLogs);


export default router;