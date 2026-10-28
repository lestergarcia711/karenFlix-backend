import { Router } from 'express';
import { updateResena, deleteResena } from '../controllers/resena.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { validateResenaId, validateResena } from '../middlewares/validation.middleware.js';

const router = Router();

// Editar o borrar resenas propias (recalcula la nota de la pelicula en transaccion MySQL)
router.put('/:id', authenticateJWT, validateResenaId, validateResena, updateResena);
router.delete('/:id', authenticateJWT, validateResenaId, deleteResena);

export default router;
