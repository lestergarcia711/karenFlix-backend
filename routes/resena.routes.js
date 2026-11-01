import { Router } from 'express';
import { ResenaController, resenaController } from '../controllers/resena.controller.js';
import { ReaccionController, reaccionController } from '../controllers/reaccion.controller.js';
import { AuthMiddleware, authMiddleware } from '../middlewares/auth.middleware.js';
import { ValidationMiddleware, validationMiddleware } from '../middlewares/validation.middleware.js';

export class ResenaRoutes {
  #router;
  #resenaController;
  #reaccionController;
  #authMiddleware;
  #validationMiddleware;

  constructor(
    resenaControllerInstance = resenaController || new ResenaController(),
    reaccionControllerInstance = reaccionController || new ReaccionController(),
    authMiddlewareInstance = authMiddleware || new AuthMiddleware(),
    validationMiddlewareInstance = validationMiddleware || new ValidationMiddleware()
  ) {
    this.#router = Router();
    this.#resenaController = resenaControllerInstance;
    this.#reaccionController = reaccionControllerInstance;
    this.#authMiddleware = authMiddlewareInstance;
    this.#validationMiddleware = validationMiddlewareInstance;

    this.#initializeRoutes();
  }

  #initializeRoutes() {
    // HU-11: Editar o borrar resenas propias (recalcula la nota de la pelicula en transaccion MySQL)
    this.#router.put(
      '/:id',
      this.#authMiddleware.authenticateJWT,
      this.#validationMiddleware.getResenaIdValidator(),
      this.#validationMiddleware.getResenaValidator(),
      this.#resenaController.updateResena
    );

    this.#router.delete(
      '/:id',
      this.#authMiddleware.authenticateJWT,
      this.#validationMiddleware.getResenaIdValidator(),
      this.#resenaController.deleteResena
    );

    // HU-12: Dar, cambiar o quitar like/dislike a resenas de otros usuarios (transaccion MySQL)
    this.#router.post(
      '/:id/reacciones',
      this.#authMiddleware.authenticateJWT,
      this.#validationMiddleware.getResenaIdValidator(),
      this.#validationMiddleware.getReaccionValidator(),
      this.#reaccionController.reactToResena
    );

    this.#router.delete(
      '/:id/reacciones',
      this.#authMiddleware.authenticateJWT,
      this.#validationMiddleware.getResenaIdValidator(),
      this.#reaccionController.removeReaction
    );
  }

  getRouter() {
    return this.#router;
  }
}

export const resenaRoutes = new ResenaRoutes();

export default resenaRoutes.getRouter();
