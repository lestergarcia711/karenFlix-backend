import { Router } from 'express';
import {
  getApprovedPeliculas,
  getRankingPeliculas,
  getPeliculaById,
  getPeliculasForAdmin,
  createPelicula,
  reviewPelicula,
  updatePelicula,
  deletePelicula
} from '../controllers/pelicula.controller.js';
import {
  getResenasByPelicula,
  createResena
} from '../controllers/resena.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  validatePelicula,
  validatePeliculaId,
  validatePeliculaQuery,
  validatePeliculaStatus,
  validateUpdatePelicula,
  validateResena
} from '../middlewares/validation.middleware.js';

const router = Router();

// HU-08, HU-13 y HU-14: Lista publica con filtro por categoria y orden por ranking o popularidad
router.get('/', validatePeliculaQuery, getApprovedPeliculas);

// HU-13: Ranking de peliculas ordenadas de mejor a peor (por ranking ponderado o popularidad)
router.get('/ranking', validatePeliculaQuery, getRankingPeliculas);

// HU-08: Listado para panel de administrador (todas o filtradas por ?estado=pendiente|aprobada|rechazada)
router.get(
  '/admin',
  authenticateJWT,
  authorizeRoles('administrador'),
  getPeliculasForAdmin
);

// HU-14: Vista de detalle de pelicula con su informacion y resenas asociadas
router.get('/:id', validatePeliculaId, getPeliculaById);

// HU-07: Cualquier usuario autenticado puede proponer una pelicula o serie (queda en estado 'pendiente')
router.post('/', authenticateJWT, validatePelicula, createPelicula);

// HU-10: Consultar y escribir resenas sobre una pelicula (con transaccion MySQL y actualizacion de nota)
router.get('/:id/resenas', validatePeliculaId, getResenasByPelicula);
router.post('/:id/resenas', authenticateJWT, validatePeliculaId, validateResena, createResena);

// HU-08: Solo el administrador puede aprobar o rechazar peliculas enviadas
router.patch(
  '/:id/estado',
  authenticateJWT,
  authorizeRoles('administrador'),
  validatePeliculaId,
  validatePeliculaStatus,
  reviewPelicula
);

// HU-09: Solo el administrador puede editar o eliminar peliculas
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('administrador'),
  validatePeliculaId,
  validateUpdatePelicula,
  updatePelicula
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('administrador'),
  validatePeliculaId,
  deletePelicula
);

export default router;
