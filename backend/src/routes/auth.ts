// src/routes/auth.ts
import { Router } from 'express';
import AuthController from '../controllers/base/general';
import { validateBody } from '../middlewares/validations';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { Permission } from '../utils/permissions';
import Joi from 'joi';

const router = Router();

// Schemas\```json
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
const forgotSchema = Joi.object({ email: Joi.string().email().required() });
const resetSchema = Joi.object({ token: Joi.string().required(), newPassword: Joi.string().min(6).required() });

// Routes
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/logout', authenticate, checkPermission(Permission.LOGOUT), AuthController.logout);
router.post('/forgot-password', validateBody(forgotSchema), AuthController.forgotPassword);
router.post('/reset-password', validateBody(resetSchema), AuthController.resetPassword);
router.get('/notifications', authenticate, checkPermission(Permission.VIEW_NOTIFICATIONS),AuthController.viewNotifications);


export default router;
