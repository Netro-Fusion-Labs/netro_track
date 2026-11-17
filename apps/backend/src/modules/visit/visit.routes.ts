import { Router } from 'express';
import { VisitController } from './visit.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new VisitController();

router.use(authenticateToken);

router.get('/', requirePermission('visits.records.view'), controller.getVisits);
router.post('/', requirePermission('visits.records.create'), controller.createVisit);
router.get('/today', requirePermission('visits.records.view'), controller.getTodayVisits);
router.get('/:id', requirePermission('visits.records.view'), controller.getVisitById);

export { router as visitRouter };
