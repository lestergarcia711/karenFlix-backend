import { ReaccionService, reaccionService } from '../services/reaccion.service.js';

export class ReaccionController {
  #reaccionService;
  #mensajesPorAccion;

  constructor(reaccionServiceInstance = reaccionService || new ReaccionService()) {
    this.#reaccionService = reaccionServiceInstance;
    this.#mensajesPorAccion = {
      creada: 'Reaccion registrada exitosamente.',
      actualizada: 'Reaccion actualizada exitosamente.',
      eliminada: 'Reaccion eliminada exitosamente.'
    };

    this.reactToResena = this.reactToResena.bind(this);
    this.removeReaction = this.removeReaction.bind(this);
  }

  #resolveActionMessage(accion) {
    return this.#mensajesPorAccion[accion] || this.#mensajesPorAccion.actualizada;
  }

  #sendSuccess(res, statusCode, data, message) {
    return res.status(statusCode).json({
      ok: true,
      message,
      data
    });
  }

  async reactToResena(req, res, next) {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      const resultado = await this.#reaccionService.reactToResena({
        resena_id: id,
        usuario_id: req.user.id,
        tipo
      });

      return this.#sendSuccess(
        res,
        200,
        resultado,
        this.#resolveActionMessage(resultado.accion)
      );
    } catch (error) {
      return next(error);
    }
  }

  async removeReaction(req, res, next) {
    try {
      const { id } = req.params;

      const resultado = await this.#reaccionService.removeReaction({
        resena_id: id,
        usuario_id: req.user.id
      });

      return this.#sendSuccess(
        res,
        200,
        resultado,
        this.#mensajesPorAccion.eliminada
      );
    } catch (error) {
      return next(error);
    }
  }
}

export const reaccionController = new ReaccionController();
export const { reactToResena, removeReaction } = reaccionController;

export default ReaccionController;
