import { Router } from 'express';
import { updateResena, deleteResena } from '../controllers/resena.controller.js';
import { reactToResena, removeReaction } from '../controllers/reaccion.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import {
  validateResenaId,
  validateResena,
  validateReaccion
} from '../middlewares/validation.middleware.js';

const router = Router();

// HU-11: Editar o borrar resenas propias (recalcula la nota de la pelicula en transaccion MySQL)
router.put('/:id', authenticateJWT, validateResenaId, validateResena, updateResena);
router.delete('/:id', authenticateJWT, validateResenaId, deleteResena);

// HU-12: Dar, cambiar o quitar like/dislike a resenas de otros usuarios (transaccion MySQL)
router.post('/:id/reacciones', authenticateJWT, validateResenaId, validateReaccion, reactToResena);
router.delete('/:id/reacciones', authenticateJWT, validateResenaId, removeReaction);

export default router;
