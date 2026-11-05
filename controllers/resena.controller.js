import { resenaService } from '../services/resena.service.js';

export class ResenaController {
  #resenaService;

  constructor(resenaServiceInstance = resenaService) {
    this.#resenaService = resenaServiceInstance;

    this.getResenasByPelicula = this.getResenasByPelicula.bind(this);
    this.createResena = this.createResena.bind(this);
    this.updateResena = this.updateResena.bind(this);
    this.deleteResena = this.deleteResena.bind(this);
  }

  #sendSuccess(res, statusCode, data, message = null) {
    const payload = { ok: true };
    if (message) {
      payload.message = message;
    }
    payload.data = data;
    return res.status(statusCode).json(payload);
  }

  async getResenasByPelicula(req, res, next) {
    try {
      const { id } = req.params;
      const resenas = await this.#resenaService.getResenasByPelicula(id);
      return this.#sendSuccess(res, 200, { resenas });
    } catch (error) {
      return next(error);
    }
  }

  async createResena(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, comentario, calificacion } = req.body;

      const resena = await this.#resenaService.createResena({
        pelicula_id: id,
        usuario_id: req.user.id,
        titulo,
        comentario,
        calificacion
      });

      return this.#sendSuccess(
        res,
        201,
        { resena },
        'Resena creada exitosamente. La calificacion de la pelicula ha sido actualizada.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async updateResena(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, comentario, calificacion } = req.body;

      const resena = await this.#resenaService.updateResena(id, {
        usuario_id: req.user.id,
        titulo,
        comentario,
        calificacion
      });

      return this.#sendSuccess(
        res,
        200,
        { resena },
        'Resena actualizada exitosamente. La calificacion de la pelicula ha sido recalculada.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async deleteResena(req, res, next) {
    try {
      const { id } = req.params;
      const resena = await this.#resenaService.deleteResena(id, {
        usuario_id: req.user.id
      });

      return this.#sendSuccess(
        res,
        200,
        { resena },
        'Resena eliminada exitosamente. La calificacion de la pelicula ha sido recalculada.'
      );
    } catch (error) {
      return next(error);
    }
  }
}

export const resenaController = new ResenaController();

export default ResenaController;
