import { Router } from 'express';
import { TrackingController } from './tracking.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new TrackingController();

router.use(authenticateToken);

// Field employees sync their own GPS while punched in / tracked
router.post('/sync', requirePermission('attendance.punch.create'), controller.syncBatch);
// Own-route access is scoped in the controller; managers also use this for playback
router.get('/route', controller.getRoute);
router.get('/live', requirePermission('tracking.live_map.view'), controller.getLiveLocations);

export { router as trackingRouter };
