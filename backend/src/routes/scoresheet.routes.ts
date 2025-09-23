import { Router } from 'express';
import DefenceController from '../controllers/defence.controller';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';

import { Permission } from '../utils/permissions';

const router = Router();

router.post('/dept-score-sheet', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), DefenceController.createDeptScoreSheet);
router.get('/dept-score-sheet/:scoresheetId', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), DefenceController.getDeptScoreSheet);
router.put('/dept-score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), DefenceController.UpdateCriterionDeptScoreSheet);
router.delete('/dept-score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), DefenceController.deleteCriterionDeptScoreSheet);
router.post('/score-sheet', authenticate, checkPermission(Permission.GENERATE_GENERAL_SCORE_SHEET), DefenceController.createGeneralScoreSheet);
router.put('/score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_GENERAL_SCORE_SHEET), DefenceController.updateGenCriterion);
router.delete('/score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_GENERAL_SCORE_SHEET), DefenceController.updateGenCriterion);




export default router;