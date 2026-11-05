import { Router } from 'express';
import { peliculaController } from '../controllers/pelicula.controller.js';
import { resenaController } from '../controllers/resena.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';

export class PeliculaRoutes {
  #router;
  #peliculaController;
  #resenaController;
  #authMiddleware;
  #validationMiddleware;
  #adminRole;

  constructor(
    peliculaControllerInstance = peliculaController,
    resenaControllerInstance = resenaController,
    authMiddlewareInstance = authMiddleware,
    validationMiddlewareInstance = validationMiddleware
  ) {
    this.#router = Router();
    this.#peliculaController = peliculaControllerInstance;
    this.#resenaController = resenaControllerInstance;
    this.#authMiddleware = authMiddlewareInstance;
    this.#validationMiddleware = validationMiddlewareInstance;
    this.#adminRole = 'administrador';

    this.#initializeRoutes();
  }

  #initializeQueryRoutes() {
    // HU-08, HU-13 y HU-14: Lista publica con filtro por categoria y orden por ranking o popularidad
    this.#router.get(
      '/',
      this.#validationMiddleware.getPeliculaQueryValidator(),
      this.#peliculaController.getApprovedPeliculas
    );

    // HU-13: Ranking de peliculas ordenadas de mejor a peor (por ranking ponderado o popularidad)
    this.#router.get(
      '/ranking',
      this.#validationMiddleware.getPeliculaQueryValidator(),
      this.#peliculaController.getRankingPeliculas
    );

    // HU-08: Listado para panel de administrador (todas o filtradas por ?estado=pendiente|aprobada|rechazada)
    this.#router.get(
      '/admin',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#peliculaController.getPeliculasForAdmin
    );

    // HU-14: Vista de detalle de pelicula con su informacion y resenas asociadas
    this.#router.get(
      '/:id',
      this.#validationMiddleware.getPeliculaIdValidator(),
      this.#peliculaController.getPeliculaById
    );
  }

  #initializeMutationRoutes() {
    // HU-07: Cualquier usuario autenticado puede proponer una pelicula o serie (queda en estado 'pendiente')
    this.#router.post(
      '/',
      this.#authMiddleware.authenticateJWT,
      this.#validationMiddleware.getPeliculaValidator(),
      this.#peliculaController.createPelicula
    );

    // HU-10: Consultar y escribir resenas sobre una pelicula (con transaccion MySQL y actualizacion de nota)
    this.#router.get(
      '/:id/resenas',
      this.#validationMiddleware.getPeliculaIdValidator(),
      this.#resenaController.getResenasByPelicula
    );

    this.#router.post(
      '/:id/resenas',
      this.#authMiddleware.authenticateJWT,
      this.#validationMiddleware.getPeliculaIdValidator(),
      this.#validationMiddleware.getResenaValidator(),
      this.#resenaController.createResena
    );

    // HU-08: Solo el administrador puede aprobar o rechazar peliculas enviadas
    this.#router.patch(
      '/:id/estado',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#validationMiddleware.getPeliculaIdValidator(),
      this.#validationMiddleware.getPeliculaStatusValidator(),
      this.#peliculaController.reviewPelicula
    );

    // HU-09: Solo el administrador puede editar o eliminar peliculas
    this.#router.put(
      '/:id',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#validationMiddleware.getPeliculaIdValidator(),
      this.#validationMiddleware.getUpdatePeliculaValidator(),
      this.#peliculaController.updatePelicula
    );

    this.#router.delete(
      '/:id',
      this.#authMiddleware.authenticateJWT,
      this.#authMiddleware.authorizeRoles(this.#adminRole),
      this.#validationMiddleware.getPeliculaIdValidator(),
      this.#peliculaController.deletePelicula
    );
  }

  #initializeRoutes() {
    this.#initializeQueryRoutes();
    this.#initializeMutationRoutes();
  }

  getRouter() {
    return this.#router;
  }
}

export const peliculaRoutes = new PeliculaRoutes();

export default peliculaRoutes.getRouter();
