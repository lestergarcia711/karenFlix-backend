import { authService } from '../services/auth.service.js';

export class AuthController {
  #authService;

  constructor(authServiceInstance = authService) {
    this.#authService = authServiceInstance;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  #sendSuccess(res, statusCode, data, message = null) {
    const payload = { ok: true };
    if (message) {
      payload.message = message;
    }
    payload.data = data;
    return res.status(statusCode).json(payload);
  }

  async register(req, res, next) {
    try {
      const { nombre, correo, contrasena } = req.body;
      const resultado = await this.#authService.register({ nombre, correo, contrasena });

      return this.#sendSuccess(
        res,
        201,
        resultado,
        'Usuario registrado exitosamente.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { correo, contrasena } = req.body;
      const resultado = await this.#authService.login({ correo, contrasena });

      return this.#sendSuccess(
        res,
        200,
        resultado,
        'Inicio de sesion exitoso.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      return this.#sendSuccess(res, 200, {
        usuario: req.user
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();

export default AuthController;
