import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoria.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validateCategory, validateCategoryId } from '../middlewares/validation.middleware.js';

const router = Router();

// Rutas publicas (cualquier persona puede ver las categorias)
router.get('/', getAllCategories);
router.get('/:id', validateCategoryId, getCategoryById);

// Rutas protegidas (solo administrador puede crear, editar o borrar categorias)
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('administrador'),
  validateCategory,
  createCategory
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('administrador'),
  validateCategoryId,
  validateCategory,
  updateCategory
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('administrador'),
  validateCategoryId,
  deleteCategory
);

export default router;
