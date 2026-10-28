import { Router } from 'express';
import {
  getApprovedPeliculas,
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
  validatePeliculaStatus,
  validateUpdatePelicula,
  validateResena
} from '../middlewares/validation.middleware.js';

const router = Router();

// Lista publica (solo peliculas aprobadas apareceran)
router.get('/', getApprovedPeliculas);

// Listado para panel de administrador (todas o filtradas por ?estado=pendiente|aprobada|rechazada)
router.get(
  '/admin',
  authenticateJWT,
  authorizeRoles('administrador'),
  getPeliculasForAdmin
);

// Cualquier usuario autenticado puede proponer una pelicula o serie (queda en estado 'pendiente')
router.post('/', authenticateJWT, validatePelicula, createPelicula);

// Consultar y escribir resenas sobre una pelicula (con transaccion MySQL y actualizacion de nota)
router.get('/:id/resenas', validatePeliculaId, getResenasByPelicula);
router.post('/:id/resenas', authenticateJWT, validatePeliculaId, validateResena, createResena);

// Solo el administrador puede aprobar o rechazar peliculas enviadas
router.patch(
  '/:id/estado',
  authenticateJWT,
  authorizeRoles('administrador'),
  validatePeliculaId,
  validatePeliculaStatus,
  reviewPelicula
);

// Solo el administrador puede editar o eliminar peliculas
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
