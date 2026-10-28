import { Router } from 'express';
import {
  getApprovedPeliculas,
  getPeliculasForAdmin,
  createPelicula,
  reviewPelicula,
  updatePelicula,
  deletePelicula
} from '../controllers/pelicula.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  validatePelicula,
  validatePeliculaId,
  validatePeliculaStatus,
  validateUpdatePelicula
} from '../middlewares/validation.middleware.js';

const router = Router();

// HU-08: Lista publica (solo peliculas aprobadas aparecen en la lista publica)
router.get('/', getApprovedPeliculas);

// HU-08: Listado para panel de administrador (todas o filtradas por ?estado=pendiente|aprobada|rechazada)
router.get(
  '/admin',
  authenticateJWT,
  authorizeRoles('administrador'),
  getPeliculasForAdmin
);

// HU-07: Cualquier usuario autenticado puede proponer una pelicula o serie (queda en estado 'pendiente')
router.post('/', authenticateJWT, validatePelicula, createPelicula);

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
