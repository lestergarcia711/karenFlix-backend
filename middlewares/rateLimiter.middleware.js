import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

export class RateLimiterMiddleware {
  #windowMs;
  #maxRequests;
  #limiter;

  constructor(customOptions = {}) {
    this.#windowMs = Number(customOptions.windowMs || process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
    this.#maxRequests = Number(customOptions.max || process.env.RATE_LIMIT_MAX) || 100;
    this.#limiter = this.#createLimiter();
  }

  #buildRateLimitMessage() {
    return {
      ok: false,
      status: 'fail',
      message: 'Demasiadas peticiones desde esta direccion IP. Por favor, intentalo de nuevo mas tarde.'
    };
  }

  #createLimiter() {
    return rateLimit({
      windowMs: this.#windowMs,
      max: this.#maxRequests,
      standardHeaders: true,
      legacyHeaders: false,
      message: this.#buildRateLimitMessage()
    });
  }

  getMiddleware() {
    return this.#limiter;
  }
}

export const rateLimiterMiddleware = new RateLimiterMiddleware();
export const apiRateLimiter = rateLimiterMiddleware.getMiddleware();

export default apiRateLimiter;
