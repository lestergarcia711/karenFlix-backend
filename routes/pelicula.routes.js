import { Router } from 'express';
import { createPelicula } from '../controllers/pelicula.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { validatePelicula } from '../middlewares/validation.middleware.js';

const router = Router();

// HU-07: Cualquier usuario autenticado puede proponer una pelicula o serie (queda en estado 'pendiente')
router.post('/', authenticateJWT, validatePelicula, createPelicula);

export default router;
