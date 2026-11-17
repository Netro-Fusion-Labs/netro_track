import { Router } from 'express';
import { InspectionController } from './inspection.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new InspectionController();

router.use(authenticateToken);

router.get('/', requirePermission('inspections.audits.view'), controller.getInspections);
router.post('/', requirePermission('inspections.audits.create'), controller.createInspection);
router.get('/today', requirePermission('inspections.audits.view'), controller.getTodayInspections);
router.get('/:id', requirePermission('inspections.audits.view'), controller.getInspectionById);

export { router as inspectionRouter };
