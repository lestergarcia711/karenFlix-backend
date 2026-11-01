import { AppError } from '../utils/AppError.js';

export class ErrorMiddleware {
  #environment;
  #defaultStatusCode;
  #defaultStatus;
  #defaultMessage;

  constructor(environment = process.env.NODE_ENV || 'production') {
    this.#environment = environment;
    this.#defaultStatusCode = 500;
    this.#defaultStatus = 'error';
    this.#defaultMessage = 'Error interno del servidor.';

    this.notFoundHandler = this.notFoundHandler.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
  }

  #buildErrorPayload(err, statusCode, status, message) {
    const response = {
      ok: false,
      status,
      message
    };

    if (err.details) {
      response.details = err.details;
    }

    if (this.#environment === 'development' && statusCode === 500) {
      response.stack = err.stack;
    }

    return response;
  }

  notFoundHandler(req, _res, next) {
    next(new AppError(`No se encontro la ruta solicitada: ${req.originalUrl}`, 404));
  }

  errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || this.#defaultStatusCode;
    const status = err.status || this.#defaultStatus;
    const message = err.message || this.#defaultMessage;

    const response = this.#buildErrorPayload(err, statusCode, status, message);

    res.status(statusCode).json(response);
  }
}

export const errorMiddleware = new ErrorMiddleware();
export const { notFoundHandler, errorHandler } = errorMiddleware;

export default ErrorMiddleware;
