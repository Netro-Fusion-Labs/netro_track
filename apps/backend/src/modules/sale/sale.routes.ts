import { Router } from 'express';
import { SaleController } from './sale.controller';
import { authenticateToken } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new SaleController();

router.use(authenticateToken);

router.get('/', requirePermission('sales.orders.view'), controller.getSales);
router.post('/', requirePermission('sales.orders.create'), controller.createSale);
router.get('/today', requirePermission('sales.orders.view'), controller.getTodaySales);
router.get('/:id', requirePermission('sales.orders.view'), controller.getSaleById);

export { router as saleRouter };
