import passport from '../config/passport.js';
import { AppError } from '../utils/AppError.js';

export class AuthMiddleware {
  #passport;
  #sessionEnabled;

  constructor(passportInstance = passport, sessionEnabled = false) {
    this.#passport = passportInstance;
    this.#sessionEnabled = sessionEnabled;

    this.authenticateJWT = this.authenticateJWT.bind(this);
    this.authorizeRoles = this.authorizeRoles.bind(this);
  }

  #resolveTokenErrorMessage(info) {
    if (info && info.name === 'TokenExpiredError') {
      return 'Tu sesion ha expirado. Por favor, inicia sesion nuevamente.';
    }
    return 'No autorizado. Debes proporcionar un token de acceso valido.';
  }

  #hasRequiredRole(usuario, allowedRoles) {
    return allowedRoles.includes(usuario.rol);
  }

  authenticateJWT(req, res, next) {
    this.#passport.authenticate(
      'jwt',
      { session: this.#sessionEnabled },
      (err, usuario, info) => {
        if (err) {
          return next(err);
        }

        if (!usuario) {
          const message = this.#resolveTokenErrorMessage(info);
          return next(new AppError(message, 401));
        }

        req.user = usuario;
        return next();
      }
    )(req, res, next);
  }

  authorizeRoles(...allowedRoles) {
    return (req, _res, next) => {
      if (!req.user) {
        return next(new AppError('No autorizado. Debes iniciar sesion primero.', 401));
      }

      if (!this.#hasRequiredRole(req.user, allowedRoles)) {
        return next(
          new AppError(
            'Acceso denegado: no tienes permisos suficientes para acceder a este recurso.',
            403
          )
        );
      }

      return next();
    };
  }
}

export const authMiddleware = new AuthMiddleware();

export default AuthMiddleware;
