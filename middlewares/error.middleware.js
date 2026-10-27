import { AppError } from '../utils/AppError.js';

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`No se encontro la ruta solicitada: ${req.originalUrl}`, 404));
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Error interno del servidor.';

  const response = {
    ok: false,
    status,
    message
  };

  if (err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
