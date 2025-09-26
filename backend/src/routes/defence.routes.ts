import { Router } from 'express';
import DefenceController from '../controllers/defence.controller';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { validateBody } from '../middlewares/validations';
import { Permission } from '../utils/permissions';
import Joi from 'joi';


const router = Router();


const scheduleDefenceSchema = Joi.object({
  stage: Joi.string().trim().required(),

  program: Joi.string()
    .valid("MSC", "PHD")
    .required(),

  session: Joi.string().trim().required(),

  date: Joi.date()
    .iso()
    .greater("now")
    .required(),

  time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // HH:mm format
    .required(),

  studentIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),

  panelMemberIds: Joi.array()
    .items(Joi.string().required()),
});

// Get all defences
router.get('/', authenticate, DefenceController.getAllDefences);
router.get('/:defenceId', authenticate, DefenceController.getDefenceDetails);
router.get('/:level', authenticate, DefenceController.getLatestDefence);
router.post('/schedule', authenticate, checkPermission(Permission.SCHEDULE_DEFENSE), validateBody(scheduleDefenceSchema), DefenceController.scheduleDefence);
router.post('/start/:defenceId', authenticate, checkPermission(Permission.START_DEFENSE), DefenceController.startDefence);
router.post('/submit-score/:defenceId', authenticate, checkPermission(Permission.SCORE_STUDENT), DefenceController.submitScore);
router.post('/end/:defenceId', authenticate, checkPermission(Permission.END_DEFENSE), DefenceController.endDefence);
router.post('/approve/:studentId', authenticate, checkPermission(Permission.APPROVE_DEFENSE), DefenceController.approveStudentDefence);


export default router;
