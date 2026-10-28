import passport from '../config/passport.js';
import { AppError } from '../utils/AppError.js';

export const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, usuario, info) => {
    if (err) {
      return next(err);
    }

    if (!usuario) {
      const message =
        info && info.name === 'TokenExpiredError'
          ? 'Tu sesion ha expirado. Por favor, inicia sesion nuevamente.'
          : 'No autorizado. Debes proporcionar un token de acceso valido.';
      return next(new AppError(message, 401));
    }

    req.user = usuario;
    return next();
  })(req, res, next);
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('No autorizado. Debes iniciar sesion primero.', 401));
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return next(
        new AppError(
          'Acceso denegado: no tienes permisos suficientes para acceder a este recurso.',
          403
        )
      );
    }

    return next();
  };
};
