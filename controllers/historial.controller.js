import { historialService } from '../services/historial.service.js';

export class HistorialController {
  #historialService;

  constructor(historialServiceInstance = historialService) {
    this.#historialService = historialServiceInstance;

    this.getMyHistorial = this.getMyHistorial.bind(this);
  }

  #sendSuccess(res, statusCode, data, message = null) {
    const payload = { ok: true };
    if (message) {
      payload.message = message;
    }
    payload.data = data;
    return res.status(statusCode).json(payload);
  }

  async getMyHistorial(req, res, next) {
    try {
      const { tipo_accion, tipo, accion, fecha, fecha_inicio, fecha_fin, orden } = req.query;
      const resultado = await this.#historialService.getHistorialByUsuario(req.user.id, {
        tipo_accion,
        tipo,
        accion,
        fecha,
        fecha_inicio,
        fecha_fin,
        orden
      });

      return this.#sendSuccess(res, 200, resultado);
    } catch (error) {
      return next(error);
    }
  }
}

export const historialController = new HistorialController();

export default HistorialController;
