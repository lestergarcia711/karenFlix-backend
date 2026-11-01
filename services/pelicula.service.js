import { PeliculaModel, peliculaModel } from '../models/pelicula.model.js';
import { CategoriaModel, categoriaModel } from '../models/categoria.model.js';
import { ResenaModel, resenaModel } from '../models/resena.model.js';
import { AppError } from '../utils/AppError.js';

export class PeliculaService {
  #peliculaModel;
  #categoriaModel;
  #resenaModel;
  #estadosValidos;
  #defaultOrden;
  #defaultRankingOrden;
  #defaultTipo;

  constructor(
    peliculaModelInstance = peliculaModel || new PeliculaModel(),
    categoriaModelInstance = categoriaModel || new CategoriaModel(),
    resenaModelInstance = resenaModel || new ResenaModel()
  ) {
    this.#peliculaModel = peliculaModelInstance;
    this.#categoriaModel = categoriaModelInstance;
    this.#resenaModel = resenaModelInstance;
    this.#estadosValidos = ['pendiente', 'aprobada', 'rechazada'];
    this.#defaultOrden = 'recientes';
    this.#defaultRankingOrden = 'ranking';
    this.#defaultTipo = 'pelicula';
  }

  async #findPeliculaOrFail(id, onlyApproved = false) {
    const pelicula = await this.#peliculaModel.findById(id);
    if (!pelicula) {
      const msg = onlyApproved
        ? 'La pelicula o serie solicitada no existe o no esta disponible.'
        : 'La pelicula o serie solicitada no existe.';
      throw new AppError(msg, 404);
    }

    if (onlyApproved && pelicula.estado !== 'aprobada') {
      throw new AppError('La pelicula o serie solicitada no existe o no esta disponible.', 404);
    }

    return pelicula;
  }

  async #ensureCategoriaExists(categoria_id) {
    const categoria = await this.#categoriaModel.findById(categoria_id);
    if (!categoria) {
      throw new AppError('La categoria seleccionada no existe.', 404);
    }
    return categoria;
  }

  async #ensureUniqueTitle(titulo, excludeId = null) {
    const existing = await this.#peliculaModel.findByTitle(titulo);
    if (!existing) {
      return;
    }

    if (excludeId === null) {
      throw new AppError('Ya existe una pelicula o serie registrada con ese titulo.', 409);
    }

    if (Number(existing.id) !== Number(excludeId)) {
      throw new AppError('Ya existe otra pelicula o serie registrada con ese titulo.', 409);
    }
  }

  #validateEstadoFilter(estado) {
    if (estado && !this.#estadosValidos.includes(estado)) {
      throw new AppError("El filtro de estado debe ser 'pendiente', 'aprobada' o 'rechazada'.", 400);
    }
  }

  async getApprovedPeliculas({ categoria_id, tipo, busqueda, orden } = {}) {
    return this.#peliculaModel.findAllApproved({
      categoria_id,
      tipo,
      busqueda,
      orden: orden || this.#defaultOrden
    });
  }

  async getRankingPeliculas({ orden = 'ranking', categoria_id = null, limite = 20 } = {}) {
    return this.#peliculaModel.findRanking({
      orden: orden || this.#defaultRankingOrden,
      categoria_id,
      limite
    });
  }

  async getPeliculaDetail(id) {
    const pelicula = await this.#findPeliculaOrFail(id, true);
    const resenas = await this.#resenaModel.findAllByPelicula(id);

    return {
      pelicula,
      resenas
    };
  }

  async getPeliculasForAdmin(estado = null) {
    this.#validateEstadoFilter(estado);
    return this.#peliculaModel.findAllForAdmin(estado);
  }

  async createPelicula({
    titulo,
    descripcion,
    tipo = 'pelicula',
    categoria_id,
    anio,
    imagen_url = null,
    creado_por
  }) {
    await this.#ensureCategoriaExists(categoria_id);
    await this.#ensureUniqueTitle(titulo);

    try {
      return await this.#peliculaModel.create({
        titulo,
        descripcion,
        tipo: tipo || this.#defaultTipo,
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
  }

  async reviewPelicula(id, { estado, revisado_por }) {
    await this.#findPeliculaOrFail(id);
    return this.#peliculaModel.updateStatus(id, { estado, revisado_por });
  }

  async updatePelicula(id, { titulo, descripcion, tipo, categoria_id, anio, imagen_url }) {
    const currentPelicula = await this.#findPeliculaOrFail(id);
    await this.#ensureCategoriaExists(categoria_id);
    await this.#ensureUniqueTitle(titulo, id);

    try {
      return await this.#peliculaModel.update(id, {
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
  }

  async deletePelicula(id) {
    const currentPelicula = await this.#findPeliculaOrFail(id);
    await this.#peliculaModel.remove(id);
    return currentPelicula;
  }
}

export const peliculaService = new PeliculaService();

export default PeliculaService;
