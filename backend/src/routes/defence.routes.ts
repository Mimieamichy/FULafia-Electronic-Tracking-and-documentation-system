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
    .items(Joi.string().required())
    .min(1)
    .required(),

  criteria: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required(),
        weight: Joi.number().min(0).max(100).required(),
      })
    )
    .min(1)
    .required(),
});

// Get all defences
router.get('/', authenticate, DefenceController.getAllDefences);
router.post('/schedule', authenticate, checkPermission(Permission.SCHEDULE_DEFENSE), validateBody(scheduleDefenceSchema), DefenceController.scheduleDefence);
router.post('/start/:defenceId', authenticate, checkPermission(Permission.START_DEFENSE), DefenceController.startDefence);
router.post('/submit-score/:defenceId', authenticate, checkPermission(Permission.SCORE_STUDENT), DefenceController.submitScore);
router.post('/end/:defenceId', authenticate, checkPermission(Permission.END_DEFENSE), DefenceController.endDefence);
router.post('/dept-score-sheet', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), DefenceController.createDeptScoreSheet);
router.put('/dept-score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), DefenceController.UpdateCriterionDeptScoreSheet);
router.delete('/dept-score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), DefenceController.deleteCriterionDeptScoreSheet);
router.post('/score-sheet', authenticate, checkPermission(Permission.GENERATE_GENERAL_SCORE_SHEET), DefenceController.createGeneralScoreSheet);
router.put('/score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_GENERAL_SCORE_SHEET), DefenceController.updateGenCriterion);
router.delete('/score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_GENERAL_SCORE_SHEET), DefenceController.updateGenCriterion);

export default router;
