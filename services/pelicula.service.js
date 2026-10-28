import { PeliculaModel } from '../models/pelicula.model.js';
import { CategoriaModel } from '../models/categoria.model.js';
import { ResenaModel } from '../models/resena.model.js';
import { AppError } from '../utils/AppError.js';

export const PeliculaService = {
  async getApprovedPeliculas({ categoria_id, tipo, busqueda, orden } = {}) {
    return PeliculaModel.findAllApproved({
      categoria_id,
      tipo,
      busqueda,
      orden: orden || 'recientes'
    });
  },

  async getRankingPeliculas({ orden = 'ranking', categoria_id = null, limite = 20 } = {}) {
    return PeliculaModel.findRanking({
      orden: orden || 'ranking',
      categoria_id,
      limite
    });
  },

  async getPeliculaDetail(id) {
    const pelicula = await PeliculaModel.findById(id);
    if (!pelicula || pelicula.estado !== 'aprobada') {
      throw new AppError('La pelicula o serie solicitada no existe o no esta disponible.', 404);
    }

    const resenas = await ResenaModel.findAllByPelicula(id);

    return {
      pelicula,
      resenas
    };
  },

  async getPeliculasForAdmin(estado = null) {
    if (estado && !['pendiente', 'aprobada', 'rechazada'].includes(estado)) {
      throw new AppError("El filtro de estado debe ser 'pendiente', 'aprobada' o 'rechazada'.", 400);
    }
    return PeliculaModel.findAllForAdmin(estado);
  },

  async createPelicula({
    titulo,
    descripcion,
    tipo = 'pelicula',
    categoria_id,
    anio,
    imagen_url = null,
    creado_por
  }) {
    const categoria = await CategoriaModel.findById(categoria_id);
    if (!categoria) {
      throw new AppError('La categoria seleccionada no existe.', 404);
    }

    const existingTitle = await PeliculaModel.findByTitle(titulo);
    if (existingTitle) {
      throw new AppError('Ya existe una pelicula o serie registrada con ese titulo.', 409);
    }

    try {
      return await PeliculaModel.create({
        titulo,
        descripcion,
        tipo: tipo || 'pelicula',
        categoria_id,
        anio,
        imagen_url: imagen_url || null,
        creado_por
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Ya existe una pelicula o serie registrada con ese titulo.', 409);
      }
      throw error;
    }
  },

  async reviewPelicula(id, { estado, revisado_por }) {
    const pelicula = await PeliculaModel.findById(id);
    if (!pelicula) {
      throw new AppError('La pelicula o serie solicitada no existe.', 404);
    }

    return PeliculaModel.updateStatus(id, { estado, revisado_por });
  },

  async updatePelicula(id, { titulo, descripcion, tipo, categoria_id, anio, imagen_url }) {
    const currentPelicula = await PeliculaModel.findById(id);
    if (!currentPelicula) {
      throw new AppError('La pelicula o serie solicitada no existe.', 404);
    }

    const categoria = await CategoriaModel.findById(categoria_id);
    if (!categoria) {
      throw new AppError('La categoria seleccionada no existe.', 404);
    }

    const existingWithTitle = await PeliculaModel.findByTitle(titulo);
    if (existingWithTitle && Number(existingWithTitle.id) !== Number(id)) {
      throw new AppError('Ya existe otra pelicula o serie registrada con ese titulo.', 409);
    }

    try {
      return await PeliculaModel.update(id, {
        titulo,
        descripcion,
        tipo: tipo || currentPelicula.tipo,
        categoria_id,
        anio,
        imagen_url: imagen_url !== undefined ? imagen_url : currentPelicula.imagen_url
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Ya existe otra pelicula o serie registrada con ese titulo.', 409);
      }
      throw error;
    }
  },

  async deletePelicula(id) {
    const currentPelicula = await PeliculaModel.findById(id);
    if (!currentPelicula) {
      throw new AppError('La pelicula o serie solicitada no existe.', 404);
    }

    await PeliculaModel.remove(id);
    return currentPelicula;
  }
};

export default PeliculaService;
