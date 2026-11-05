import { peliculaService } from '../services/pelicula.service.js';

export class PeliculaController {
  #peliculaService;

  constructor(peliculaServiceInstance = peliculaService) {
    this.#peliculaService = peliculaServiceInstance;

    this.getApprovedPeliculas = this.getApprovedPeliculas.bind(this);
    this.getRankingPeliculas = this.getRankingPeliculas.bind(this);
    this.getPeliculaById = this.getPeliculaById.bind(this);
    this.getPeliculasForAdmin = this.getPeliculasForAdmin.bind(this);
    this.createPelicula = this.createPelicula.bind(this);
    this.reviewPelicula = this.reviewPelicula.bind(this);
    this.updatePelicula = this.updatePelicula.bind(this);
    this.deletePelicula = this.deletePelicula.bind(this);
  }

  #sendSuccess(res, statusCode, data, message = null) {
    const payload = { ok: true };
    if (message) {
      payload.message = message;
    }
    payload.data = data;
    return res.status(statusCode).json(payload);
  }

  #resolveCategoriaParam(query) {
    return query.categoria_id ?? query.categoria;
  }

  #resolveRankingCriterio(orden) {
    return orden === 'popularidad' ? 'popularidad' : 'ranking';
  }

  async getApprovedPeliculas(req, res, next) {
    try {
      const { tipo, busqueda, orden } = req.query;
      const peliculas = await this.#peliculaService.getApprovedPeliculas({
        categoria_id: this.#resolveCategoriaParam(req.query),
        tipo,
        busqueda,
        orden
      });
      return this.#sendSuccess(res, 200, { peliculas });
    } catch (error) {
      return next(error);
    }
  }

  async getRankingPeliculas(req, res, next) {
    try {
      const { orden, limite } = req.query;
      const ranking = await this.#peliculaService.getRankingPeliculas({
        orden,
        categoria_id: this.#resolveCategoriaParam(req.query),
        limite
      });
      return this.#sendSuccess(res, 200, {
        criterio: this.#resolveRankingCriterio(orden),
        ranking
      });
    } catch (error) {
      return next(error);
    }
  }

  async getPeliculaById(req, res, next) {
    try {
      const { id } = req.params;
      const detalle = await this.#peliculaService.getPeliculaDetail(id);
      return this.#sendSuccess(res, 200, detalle);
    } catch (error) {
      return next(error);
    }
  }

  async getPeliculasForAdmin(req, res, next) {
    try {
      const { estado } = req.query;
      const peliculas = await this.#peliculaService.getPeliculasForAdmin(estado);
      return this.#sendSuccess(res, 200, { peliculas });
    } catch (error) {
      return next(error);
    }
  }

  async createPelicula(req, res, next) {
    try {
      const {
        titulo,
        descripcion,
        tipo,
        categoria_id,
        anio,
        imagen_url
      } = req.body;

      const pelicula = await this.#peliculaService.createPelicula({
        titulo,
        descripcion,
        tipo,
        categoria_id,
        anio,
        imagen_url,
        creado_por: req.user.id
      });

      return this.#sendSuccess(
        res,
        201,
        { pelicula },
        'Pelicula o serie agregada exitosamente. Quedara en estado pendiente hasta que un administrador la revise.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async reviewPelicula(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const pelicula = await this.#peliculaService.reviewPelicula(id, {
        estado,
        revisado_por: req.user.id
      });

      return this.#sendSuccess(
        res,
        200,
        { pelicula },
        `Pelicula o serie ${estado} exitosamente.`
      );
    } catch (error) {
      return next(error);
    }
  }

  async updatePelicula(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, descripcion, tipo, categoria_id, anio, imagen_url } = req.body;
      const pelicula = await this.#peliculaService.updatePelicula(id, {
        titulo,
        descripcion,
        tipo,
        categoria_id,
        anio,
        imagen_url
      });

      return this.#sendSuccess(
        res,
        200,
        { pelicula },
        'Pelicula o serie actualizada exitosamente.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async deletePelicula(req, res, next) {
    try {
      const { id } = req.params;
      const pelicula = await this.#peliculaService.deletePelicula(id);

      return this.#sendSuccess(
        res,
        200,
        { pelicula },
        'Pelicula o serie eliminada exitosamente.'
      );
    } catch (error) {
      return next(error);
    }
  }
}

export const peliculaController = new PeliculaController();

export default PeliculaController;
