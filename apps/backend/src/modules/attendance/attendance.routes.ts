import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new AttendanceController();

router.use(authenticateToken);

router.get('/today', requirePermission('attendance.punch.view'), controller.getToday);
router.get('/active', requirePermission('attendance.punch.view'), controller.getActivePunch);
router.post('/punch-in', requirePermission('attendance.punch.create'), controller.punchIn);
router.post('/punch-out', requirePermission('attendance.punch.create'), controller.punchOut);
router.get('/history', requirePermission('attendance.history.view'), controller.getHistory);
router.get('/monthly', requirePermission('attendance.history.view'), controller.getMonthly);
router.get('/summary', requirePermission('attendance.history.view'), controller.getSummary);
router.get('/team', requirePermission('attendance.team.view'), controller.getTeam);
router.get('/company', requirePermission('attendance.team.company_view'), controller.getCompany);

router.get('/regularization', requirePermission('attendance.regularization.view'), controller.getRegularizations);
router.post('/regularization', requirePermission('attendance.regularization.create'), controller.requestRegularization);
router.post('/regularization/bulk-review', requirePermission('attendance.regularization.review'), controller.bulkReviewRegularizations);
router.post('/regularization/:id/review', requirePermission('attendance.regularization.review'), controller.reviewRegularization);

export { router as attendanceRouter };
