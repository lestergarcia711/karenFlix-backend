import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export class UsuarioRoutes {
  #router;
  #usuarioController;
  #authMiddleware;
  #adminRole;

  constructor(
    usuarioControllerInstance = usuarioController,
    authMiddlewareInstance = authMiddleware,
  ) {
    this.#router = Router();
    this.#usuarioController = usuarioControllerInstance;
    this.#authMiddleware = authMiddlewareInstance;
    this.#adminRole = 'administrador';

    this.#initializeRoutes();
  }

  #initializeRoutes() {
    // Ver mis peliculas propuestas y mis resenas
    this.#router.get(
      '/mi-actividad',
      this.#authMiddleware.authenticateJWT,
      this.#usuarioController.getMyActivity
    );


    // El admin podra Ver el historial de actividad del usuario.
    this.#router.get(
      '/historial',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#usuarioController.getSystemStats
    );

    // El admin puede Listar todos los usuarios
    this.#router.get(
      '/',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#usuarioController.getAllUsers
    );
  }

  getRouter() {
    return this.#router;
  }
}

export const usuarioRoutes = new UsuarioRoutes();

export default usuarioRoutes.getRouter();