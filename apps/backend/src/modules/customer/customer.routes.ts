import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createCustomerSchema, updateCustomerSchema } from '@netrotrack/shared';

const router = Router();
const controller = new CustomerController();

router.get('/', authMiddleware, requirePermission('customers.accounts.view'), controller.getCustomers);
router.get('/:id', authMiddleware, requirePermission('customers.accounts.view'), controller.getCustomer);
router.post('/', authMiddleware, requirePermission('customers.accounts.create'), validate(createCustomerSchema), controller.createCustomer);
router.put('/:id', authMiddleware, requirePermission('customers.accounts.edit'), validate(updateCustomerSchema), controller.updateCustomer);
router.delete('/:id', authMiddleware, requirePermission('customers.accounts.delete'), controller.deleteCustomer);

export { router as customerRouter };
