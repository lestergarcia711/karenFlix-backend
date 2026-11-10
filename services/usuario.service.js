import { usuarioModel } from '../models/usuario.model.js';
import { AppError } from '../utils/AppError.js';

export class UsuarioService {
  #usuarioModel;

  constructor(usuarioModelInstance = usuarioModel) {
    this.#usuarioModel = usuarioModelInstance;
  }

  async #findUserOrFail(id) {
    const usuario = await this.#usuarioModel.findById(id);
    if (!usuario) {
      throw new AppError('El usuario solicitado no existe.', 404);
    }
    return usuario;
  }

  async getAllUsers() {
    return this.#usuarioModel.findAll();
  }

  async getUserById(id) {
    return this.#findUserOrFail(id);
  }

  async deleteUser(id, currentUserId) {
    if (Number(id) === Number(currentUserId)) {
      throw new AppError('No puedes eliminar tu propia cuenta de administrador.', 400);
    }

    const currentUser = await this.#findUserOrFail(id);

    try {
      await this.#usuarioModel.remove(id);
      return currentUser;
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
        throw new AppError(
          'No se puede eliminar el usuario porque tiene peliculas o series propuestas asociadas.',
          409
        );
      }
      throw error;
    }
  }

  async getMyActivity(usuario_id) {
    return this.#usuarioModel.getUserActivity(usuario_id);
  }

  async getSystemStats() {
    return this.#usuarioModel.getSystemStats();
  }
}

export const usuarioService = new UsuarioService();

export default UsuarioService;
