import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { Permission } from '../utils/permissions';
import SessionController from '../controllers/session.controller';
import Joi from 'joi';
import { validateBody } from '../middlewares/validations';

const router = Router();


const SessionSchema = Joi.object({
  sessionName: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});


router.post('/sessions', authenticate, checkPermission(Permission.CREATE_SESSION), validateBody(SessionSchema), SessionController.createSession);
router.get('/sessions', authenticate, checkPermission(Permission.VIEW_ALL_SESSIONS), SessionController.getAllSessions);