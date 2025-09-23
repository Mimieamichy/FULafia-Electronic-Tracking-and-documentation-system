import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { Permission } from '../utils/permissions';
import NotificationController from '../controllers/notification.controller';


const router = Router();


router.get('/', authenticate, checkPermission(Permission.VIEW_NOTIFICATIONS), NotificationController.viewNotifications);
router.patch('/', authenticate, checkPermission(Permission.VIEW_NOTIFICATIONS), NotificationController.updateReadReciept);


export default router;