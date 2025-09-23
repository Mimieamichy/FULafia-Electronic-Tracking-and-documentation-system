import { Router } from 'express';
import ScoreSheetController from '../controllers/scoresheet.controller';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permission';

import { Permission } from '../utils/permissions';

const router = Router();

router.post('/dept-score-sheet', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), ScoreSheetController.createDeptScoreSheet);
router.get('/dept-score-sheet/:scoresheetId', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), ScoreSheetController.getDeptScoreSheet);
router.put('/dept-score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), ScoreSheetController.UpdateCriterionDeptScoreSheet);
router.delete('/dept-score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_DEPT_SCORE_SHEET), ScoreSheetController.deleteCriterionDeptScoreSheet);
router.post('/score-sheet', authenticate, checkPermission(Permission.GENERATE_GENERAL_SCORE_SHEET), ScoreSheetController.createGeneralScoreSheet);
router.put('/score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_GENERAL_SCORE_SHEET), ScoreSheetController.updateGenCriterion);
router.delete('/score-sheet/:criterionId', authenticate, checkPermission(Permission.GENERATE_GENERAL_SCORE_SHEET), ScoreSheetController.updateGenCriterion);




export default router;