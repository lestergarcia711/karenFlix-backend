import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller.js';
import { historialController } from '../controllers/historial.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export class UsuarioRoutes {
  #router;
  #usuarioController;
  #historialController;
  #authMiddleware;
  #adminRole;

  constructor(
    usuarioControllerInstance = usuarioController,
    historialControllerInstance = historialController,
    authMiddlewareInstance = authMiddleware
  ) {
    this.#router = Router();
    this.#usuarioController = usuarioControllerInstance;
    this.#historialController = historialControllerInstance;
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

    // Consultar historial del usuario autenticado (ordenado y filtrado por ?fecha= y ?tipo_accion=)
    this.#router.get(
      '/historial',
      this.#authMiddleware.authenticateJWT,
      this.#historialController.getMyHistorial
    );

    // Estadisticas globales para el administrador
    this.#router.get(
      '/estadisticas',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#usuarioController.getSystemStats
    );

    // El admin puede listar todos los usuarios
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
