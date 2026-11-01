import { Router } from 'express';
import semver from 'semver';
import swaggerUi from 'swagger-ui-express';
import { SwaggerConfig } from '../config/swagger.js';
import authRoutes from './auth.routes.js';
import categoriaRoutes from './categoria.routes.js';
import peliculaRoutes from './pelicula.routes.js';
import resenaRoutes from './resena.routes.js';

export class IndexRoutes {
  #router;
  #serviceName;
  #defaultVersion;
  #apiVersion;
  #apiMajor;
  #swaggerSpec;
  #authRouter;
  #categoriaRouter;
  #peliculaRouter;
  #resenaRouter;

  constructor(
    authRouterInstance = authRoutes,
    categoriaRouterInstance = categoriaRoutes,
    peliculaRouterInstance = peliculaRoutes,
    resenaRouterInstance = resenaRoutes
  ) {
    this.#router = Router();
    this.#serviceName = 'KarenFlix Backend API';
    this.#defaultVersion = '1.0.0';
    this.#apiVersion = this.#resolveValidVersion();
    this.#apiMajor = semver.major(this.#apiVersion);
    this.#swaggerSpec = this.#buildSwaggerDocument();
    this.#authRouter = authRouterInstance;
    this.#categoriaRouter = categoriaRouterInstance;
    this.#peliculaRouter = peliculaRouterInstance;
    this.#resenaRouter = resenaRouterInstance;

    this.#initializeRoutes();
  }

  #resolveValidVersion() {
    const rawVersion = process.env.API_VERSION || this.#defaultVersion;
    return semver.valid(semver.coerce(rawVersion)) || this.#defaultVersion;
  }

  #buildSwaggerDocument() {
    const swaggerConfig = new SwaggerConfig(this.#apiVersion, this.#apiMajor);
    return swaggerConfig.getSpec();
  }

  #handleHealthCheck(_req, res) {
    res.status(200).json({
      ok: true,
      service: this.#serviceName,
      version: this.#resolveValidVersion(),
      status: 'online',
      timestamp: new Date().toISOString()
    });
  }

  #initializeRoutes() {
    // Documentacion interactiva Swagger (HU-16) en /api/v1/docs
    this.#router.use('/docs', swaggerUi.serve, swaggerUi.setup(this.#swaggerSpec));

    this.#router.get('/health', (req, res) => this.#handleHealthCheck(req, res));
    this.#router.use('/auth', this.#authRouter);
    this.#router.use('/categorias', this.#categoriaRouter);
    this.#router.use('/peliculas', this.#peliculaRouter);
    this.#router.use('/resenas', this.#resenaRouter);
  }

  getRouter() {
    return this.#router;
  }
}

export const indexRoutes = new IndexRoutes();

export default indexRoutes.getRouter();
