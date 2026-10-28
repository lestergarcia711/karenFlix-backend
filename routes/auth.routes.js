import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middlewares/validation.middleware.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticateJWT, getProfile);

export default router;
