import { Router } from 'express';
import { historialController } from '../controllers/historial.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export class HistorialRoutes {
  #router;
  #historialController;
  #authMiddleware;

  constructor(
    historialControllerInstance = historialController,
    authMiddlewareInstance = authMiddleware
  ) {
    this.#router = Router();
    this.#historialController = historialControllerInstance;
    this.#authMiddleware = authMiddlewareInstance;

    this.#initializeRoutes();
  }

  #initializeRoutes() {
    this.#router.get(
      '/',
      this.#authMiddleware.authenticateJWT,
      this.#historialController.getMyHistorial
    );
  }

  getRouter() {
    return this.#router;
  }
}

export const historialRoutes = new HistorialRoutes();

export default historialRoutes.getRouter();
