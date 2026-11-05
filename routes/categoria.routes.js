import { Router } from 'express';
import { categoriaController } from '../controllers/categoria.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';

export class CategoriaRoutes {
  #router;
  #categoriaController;
  #authMiddleware;
  #validationMiddleware;
  #adminRole;

  constructor(
    categoriaControllerInstance = categoriaController,
    authMiddlewareInstance = authMiddleware,
    validationMiddlewareInstance = validationMiddleware
  ) {
    this.#router = Router();
    this.#categoriaController = categoriaControllerInstance;
    this.#authMiddleware = authMiddlewareInstance;
    this.#validationMiddleware = validationMiddlewareInstance;
    this.#adminRole = 'administrador';

    this.#initializeRoutes();
  }

  #initializePublicRoutes() {
    // Rutas publicas (cualquier persona puede ver las categorias)
    this.#router.get('/', this.#categoriaController.getAllCategories);
    this.#router.get(
      '/:id',
      this.#validationMiddleware.getCategoryIdValidator(),
      this.#categoriaController.getCategoryById
    );
  }

  #initializeAdminRoutes() {
    // Rutas protegidas (solo administrador puede crear, editar o borrar categorias)
    this.#router.post(
      '/',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#validationMiddleware.getCategoryValidator(),
      this.#categoriaController.createCategory
    );

    this.#router.put(
      '/:id',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#validationMiddleware.getCategoryIdValidator(),
      this.#validationMiddleware.getCategoryValidator(),
      this.#categoriaController.updateCategory
    );

    this.#router.delete(
      '/:id',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#validationMiddleware.getCategoryIdValidator(),
      this.#categoriaController.deleteCategory
    );
  }

  #initializeRoutes() {
    this.#initializePublicRoutes();
    this.#initializeAdminRoutes();
  }

  getRouter() {
    return this.#router;
  }
}

export const categoriaRoutes = new CategoriaRoutes();

export default categoriaRoutes.getRouter();
