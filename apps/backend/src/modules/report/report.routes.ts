import { Router } from 'express';
import { ReportController } from './report.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new ReportController();

router.use(authenticateToken);

router.get(
  '/attendance',
  requirePermission('reports.analytics.view'),
  controller.getAttendanceReport
);
router.get(
  '/visits',
  requirePermission('reports.analytics.view'),
  controller.getVisitsReport
);
router.get(
  '/sales',
  requirePermission('reports.analytics.view'),
  controller.getSalesReport
);
router.get(
  '/inspections',
  requirePermission('reports.analytics.view'),
  controller.getInspectionsReport
);

export { router as reportRouter };
