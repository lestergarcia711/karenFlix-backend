import { usuarioModel } from '../models/usuario.model.js';

export class UsuarioService {
  #usuarioModel;

  constructor(usuarioModelInstance = usuarioModel) {
    this.#usuarioModel = usuarioModelInstance;
  }

  async getAllUsers() {
    return this.#usuarioModel.findAll();
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
