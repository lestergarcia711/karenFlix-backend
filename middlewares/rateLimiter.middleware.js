import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

export const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    status: 'fail',
    message: 'Demasiadas peticiones desde esta direccion IP. Por favor, intentalo de nuevo mas tarde.'
  }
});

export default apiRateLimiter;
