import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import semver from 'semver';
import { Database, database } from './config/db.js';
import { PassportConfig, passportConfig } from './config/passport.js';
import { RateLimiterMiddleware, rateLimiterMiddleware } from './middlewares/rateLimiter.middleware.js';
import { ErrorMiddleware, errorMiddleware } from './middlewares/error.middleware.js';
import { IndexRoutes, indexRoutes } from './routes/index.routes.js';

dotenv.config();

export class Server {
  #app;
  #port;
  #apiVersion;
  #apiMajor;
  #corsOrigin;
  #database;
  #passportConfig;
  #rateLimiterMiddleware;
  #errorMiddleware;
  #indexRoutes;

  constructor({
    databaseInstance = database || new Database(),
    passportConfigInstance = passportConfig || new PassportConfig(),
    rateLimiterInstance = rateLimiterMiddleware || new RateLimiterMiddleware(),
    errorMiddlewareInstance = errorMiddleware || new ErrorMiddleware(),
    indexRoutesInstance = indexRoutes || new IndexRoutes()
  } = {}) {
    this.#app = express();
    this.#port = Number(process.env.PORT) || 3000;
    this.#apiVersion = this.#resolveApiVersion(process.env.API_VERSION);
    this.#apiMajor = semver.major(this.#apiVersion);
    this.#corsOrigin = process.env.CORS_ORIGIN || '*';

    this.#database = databaseInstance;
    this.#passportConfig = passportConfigInstance;
    this.#rateLimiterMiddleware = rateLimiterInstance;
    this.#errorMiddleware = errorMiddlewareInstance;
    this.#indexRoutes = indexRoutesInstance;

    this.#configureMiddlewares();
    this.#configureRoutes();
    this.#configureErrorHandling();
  }

  #resolveApiVersion(rawVersion = '1.0.0') {
    return semver.valid(semver.coerce(rawVersion || '1.0.0')) || '1.0.0';
  }

  #buildCorsOptions() {
    return {
      origin: this.#corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };
  }

  #configureMiddlewares() {
    // Configuracion de CORS
    this.#app.use(cors(this.#buildCorsOptions()));

    // Limitador de peticiones global (express-rate-limit)
    this.#app.use(this.#rateLimiterMiddleware.getMiddleware());

    // Parseo del cuerpo de las peticiones
    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));

    // Inicializacion de Passport (JWT)
    this.#app.use(this.#passportConfig.initialize());
  }

  #configureRoutes() {
    // Rutas base versionadas con semver
    this.#app.use(`/api/v${this.#apiMajor}`, this.#indexRoutes.getRouter());
  }

  #configureErrorHandling() {
    // Manejo de rutas no encontradas y errores centralizados
    this.#app.use(this.#errorMiddleware.notFoundHandler);
    this.#app.use(this.#errorMiddleware.errorHandler);
  }

  async #connectDatabase() {
    try {
      await this.#database.testConnection();
    } catch (error) {
      console.warn(`Advertencia al conectar a MySQL: ${error.message}`);
    }
  }

  async start() {
    await this.#connectDatabase();

    return this.#app.listen(this.#port, () => {
      console.log(
        `Servidor KarenFlix (v${this.#apiVersion}) ejecutandose en http://localhost:${this.#port}/api/v${this.#apiMajor}`
      );
      console.log(
        `Documentacion Swagger disponible en http://localhost:${this.#port}/api/v${this.#apiMajor}/docs`
      );
    });
  }

  getApp() {
    return this.#app;
  }
}

export const server = new Server();
const app = server.getApp();

server.start();

export default app;
