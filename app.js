import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import semver from 'semver';
import { testConnection } from './config/db.js';
import passport from './config/passport.js';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import indexRoutes from './routes/index.routes.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_VERSION = semver.valid(semver.coerce(process.env.API_VERSION || '1.0.0')) || '1.0.0';
const API_MAJOR = semver.major(API_VERSION);

// Configuracion de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Limitador de peticiones global (express-rate-limit)
app.use(apiRateLimiter);

// Parseo del cuerpo de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializacion de Passport (JWT)
app.use(passport.initialize());

// Rutas base versionadas con semver
app.use(`/api/v${API_MAJOR}`, indexRoutes);

// Manejo de rutas no encontradas y errores centralizados
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();
  } catch (error) {
    console.warn(`Advertencia al conectar a MySQL: ${error.message}`);
  }

  app.listen(PORT, () => {
    console.log(`Servidor KarenFlix (v${API_VERSION}) ejecutandose en http://localhost:${PORT}/api/v${API_MAJOR}`);
  });
};

startServer();

export default app;
