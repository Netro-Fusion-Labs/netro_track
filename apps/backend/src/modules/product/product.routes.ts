import { Router } from 'express';
import { ProductController } from './product.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '@netrotrack/shared';

const router = Router();
const controller = new ProductController();

router.get('/', authMiddleware, requirePermission('products.catalogue.view'), controller.getProducts);
router.get('/:id', authMiddleware, requirePermission('products.catalogue.view'), controller.getProduct);
router.post('/', authMiddleware, requirePermission('products.catalogue.create'), validate(createProductSchema), controller.createProduct);
router.put('/:id', authMiddleware, requirePermission('products.catalogue.edit'), validate(updateProductSchema), controller.updateProduct);
router.delete('/:id', authMiddleware, requirePermission('products.catalogue.delete'), controller.deleteProduct);

export { router as productRouter };
