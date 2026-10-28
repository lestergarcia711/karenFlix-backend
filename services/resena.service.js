import { ResenaModel } from '../models/resena.model.js';
import { PeliculaModel } from '../models/pelicula.model.js';
import { AppError } from '../utils/AppError.js';

export const ResenaService = {
  async getResenasByPelicula(pelicula_id) {
    const pelicula = await PeliculaModel.findById(pelicula_id);
    if (!pelicula) {
      throw new AppError('La pelicula o serie solicitada no existe.', 404);
    }

    return ResenaModel.findAllByPelicula(pelicula_id);
  },

  async createResena({ pelicula_id, usuario_id, titulo, comentario, calificacion }) {
    const pelicula = await PeliculaModel.findById(pelicula_id);
    if (!pelicula) {
      throw new AppError('La pelicula o serie solicitada no existe.', 404);
    }

    if (pelicula.estado !== 'aprobada') {
      throw new AppError('Solo se pueden escribir resenas en peliculas aprobadas.', 400);
    }

    const existingResena = await ResenaModel.findByPeliculaAndUsuario(pelicula_id, usuario_id);
    if (existingResena) {
      throw new AppError('Ya has escrito una resena para esta pelicula.', 409);
    }

    try {
      return await ResenaModel.createWithTransaction({
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
  },

  async updateResena(id, { usuario_id, titulo, comentario, calificacion }) {
    const resena = await ResenaModel.findById(id);
    if (!resena) {
      throw new AppError('La resena solicitada no existe.', 404);
    }

    if (Number(resena.usuario_id) !== Number(usuario_id)) {
      throw new AppError('Acceso denegado: solo el autor puede editar su propia resena.', 403);
    }

    return ResenaModel.updateWithTransaction(id, {
      titulo,
      comentario,
      calificacion
    });
  },

  async deleteResena(id, { usuario_id }) {
    const resena = await ResenaModel.findById(id);
    if (!resena) {
      throw new AppError('La resena solicitada no existe.', 404);
    }

    if (Number(resena.usuario_id) !== Number(usuario_id)) {
      throw new AppError('Acceso denegado: solo el autor puede eliminar su propia resena.', 403);
    }

    await ResenaModel.removeWithTransaction(id, resena.pelicula_id);
    return resena;
  }
};

export default ResenaService;
