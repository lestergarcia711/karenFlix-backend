import { resenaModel } from '../models/resena.model.js';
import { peliculaModel } from '../models/pelicula.model.js';
import { AppError } from '../utils/AppError.js';

export class ResenaService {
  #resenaModel;
  #peliculaModel;
  #estadoAprobada;

  constructor(
    resenaModelInstance = resenaModel,
    peliculaModelInstance = peliculaModel
  ) {
    this.#resenaModel = resenaModelInstance;
    this.#peliculaModel = peliculaModelInstance;
    this.#estadoAprobada = 'aprobada';
  }

  async #ensurePeliculaExists(pelicula_id, requireApproved = false) {
    const pelicula = await this.#peliculaModel.findById(pelicula_id);
    if (!pelicula) {
      throw new AppError('La pelicula o serie solicitada no existe.', 404);
    }

    if (requireApproved && pelicula.estado !== this.#estadoAprobada) {
      throw new AppError('Solo se pueden escribir resenas en peliculas aprobadas.', 400);
    }

    return pelicula;
  }

  async #ensureNoExistingResena(pelicula_id, usuario_id) {
    const existingResena = await this.#resenaModel.findByPeliculaAndUsuario(pelicula_id, usuario_id);
    if (existingResena) {
      throw new AppError('Ya has escrito una resena para esta pelicula.', 409);
    }
  }

  async #findAndVerifyOwnership(id, usuario_id, forbiddenMessage) {
    const resena = await this.#resenaModel.findById(id);
    if (!resena) {
      throw new AppError('La resena solicitada no existe.', 404);
    }

    if (Number(resena.usuario_id) !== Number(usuario_id)) {
      throw new AppError(forbiddenMessage, 403);
    }

    return resena;
  }

  async getResenasByPelicula(pelicula_id) {
    await this.#ensurePeliculaExists(pelicula_id);
    return this.#resenaModel.findAllByPelicula(pelicula_id);
  }

  async createResena({ pelicula_id, usuario_id, titulo, comentario, calificacion }) {
    await this.#ensurePeliculaExists(pelicula_id, true);
    await this.#ensureNoExistingResena(pelicula_id, usuario_id);

    try {
      return await this.#resenaModel.createWithTransaction({
        pelicula_id,
        usuario_id,
        titulo,
        comentario,
        calificacion
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Ya has escrito una resena para esta pelicula.', 409);
      }
      throw error;
    }
  }

  async updateResena(id, { usuario_id, titulo, comentario, calificacion }) {
    await this.#findAndVerifyOwnership(
      id,
      usuario_id,
      'Acceso denegado: solo el autor puede editar su propia resena.'
    );

    return this.#resenaModel.updateWithTransaction(id, {
      titulo,
      comentario,
      calificacion
    });
  }

  async deleteResena(id, { usuario_id }) {
    const resena = await this.#findAndVerifyOwnership(
      id,
      usuario_id,
      'Acceso denegado: solo el autor puede eliminar su propia resena.'
    );

    await this.#resenaModel.removeWithTransaction(id, resena.pelicula_id);
    return resena;
  }
}

export const resenaService = new ResenaService();

export default ResenaService;
