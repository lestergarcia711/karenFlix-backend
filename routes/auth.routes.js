import { Router } from 'express';
import { AuthController, authController } from '../controllers/auth.controller.js';
import { ValidationMiddleware, validationMiddleware } from '../middlewares/validation.middleware.js';
import { AuthMiddleware, authMiddleware } from '../middlewares/auth.middleware.js';

export class AuthRoutes {
  #router;
  #authController;
  #validationMiddleware;
  #authMiddleware;

  constructor(
    authControllerInstance = authController || new AuthController(),
    validationMiddlewareInstance = validationMiddleware || new ValidationMiddleware(),
    authMiddlewareInstance = authMiddleware || new AuthMiddleware()
  ) {
    this.#router = Router();
    this.#authController = authControllerInstance;
    this.#validationMiddleware = validationMiddlewareInstance;
    this.#authMiddleware = authMiddlewareInstance;

    this.#initializeRoutes();
  }

  #initializeRoutes() {
    this.#router.post(
      '/register',
      this.#validationMiddleware.getRegisterValidator(),
      this.#authController.register
    );

    this.#router.post(
      '/login',
      this.#validationMiddleware.getLoginValidator(),
      this.#authController.login
    );

    this.#router.get(
      '/profile',
      this.#authMiddleware.authenticateJWT,
      this.#authController.getProfile
    );
  }

  getRouter() {
    return this.#router;
  }
}

export const authRoutes = new AuthRoutes();

export default authRoutes.getRouter();
