import { Router } from 'express';
import semver from 'semver';
import authRoutes from './auth.routes.js';
import categoriaRoutes from './categoria.routes.js';
import peliculaRoutes from './pelicula.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  const rawVersion = process.env.API_VERSION || '1.0.0';
  const validVersion = semver.valid(semver.coerce(rawVersion)) || '1.0.0';

  res.status(200).json({
    ok: true,
    service: 'KarenFlix Backend API',
    version: validVersion,
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/peliculas', peliculaRoutes);

export default router;
