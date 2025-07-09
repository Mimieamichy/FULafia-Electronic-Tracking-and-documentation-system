import e, { Router } from 'express';
import AuthController from '../controllers/base/auth';
import { authenticate } from '../middlewares/auth';


const router = Router();



router.get('/profile', authenticate, AuthController.getUserProfile);
router.put('/updatePassword', authenticate, AuthController.updatePassword);


export default router;