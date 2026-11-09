import { usuarioService } from '../services/usuario.service.js';

export class UsuarioController {
  #usuarioService;

  constructor(usuarioServiceInstance = usuarioService) {
    this.#usuarioService = usuarioServiceInstance;

    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.getMyActivity = this.getMyActivity.bind(this);
    this.getSystemStats = this.getSystemStats.bind(this);
  }

  #sendSuccess(res, statusCode, data, message = null) {
    const payload = { ok: true };
    if (message) {
      payload.message = message;
    }
    payload.data = data;
    return res.status(statusCode).json(payload);
  }

  async getMyActivity(req, res, next) {
    try {
      const actividad = await this.#usuarioService.getMyActivity(req.user.id);
      return this.#sendSuccess(res, 200, { actividad });
    } catch (error) {
      return next(error);
    }
  }

  async getAllUsers(_req, res, next) {
    try {
      const usuarios = await this.#usuarioService.getAllUsers();
      return this.#sendSuccess(res, 200, { total: usuarios.length, usuarios });
    } catch (error) {
      return next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await this.#usuarioService.getUserById(id);
      return this.#sendSuccess(res, 200, { usuario });
    } catch (error) {
      return next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await this.#usuarioService.deleteUser(id, req.user.id);
      return this.#sendSuccess(
        res,
        200,
        { usuario },
        'Usuario eliminado exitosamente.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async getSystemStats(_req, res, next) {
    try {
      const estadisticas = await this.#usuarioService.getSystemStats();
      return this.#sendSuccess(res, 200, { estadisticas });
    } catch (error) {
      return next(error);
    }
  }
}

export const usuarioController = new UsuarioController();

export default UsuarioController;
