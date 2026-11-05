import { historialModel } from '../models/historial.model.js';
import { AppError } from '../utils/AppError.js';

export class HistorialService {
  #historialModel;
  #mapaTiposAccion;
  #ordenesValidos;

  constructor(historialModelInstance = historialModel) {
    this.#historialModel = historialModelInstance;
    this.#mapaTiposAccion = {
      registro: 'registro',
      creacion: 'registro',
      crear: 'registro',
      edicion: 'edicion',
      actualizacion: 'edicion',
      editar: 'edicion',
      eliminacion: 'eliminacion',
      borrado: 'eliminacion',
      eliminar: 'eliminacion'
    };
    this.#ordenesValidos = ['recientes', 'antiguos', 'desc', 'asc'];
  }

  #normalizeTipoAccion(rawTipo) {
    if (!rawTipo) {
      return null;
    }
    const key = String(rawTipo).trim().toLowerCase();
    const normalized = this.#mapaTiposAccion[key];
    if (!normalized) {
      throw new AppError(
        "El filtro tipo_accion debe ser 'registro', 'edicion' o 'eliminacion'.",
        400
      );
    }
    return normalized;
  }

  #validateDate(dateStr, fieldName) {
    if (!dateStr) {
      return null;
    }
    const trimmed = String(dateStr).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      throw new AppError(`El filtro ${fieldName} debe tener formato YYYY-MM-DD.`, 400);
    }
    return trimmed;
  }

  #normalizeOrden(orden) {
    if (!orden) {
      return 'recientes';
    }
    const key = String(orden).trim().toLowerCase();
    if (!this.#ordenesValidos.includes(key)) {
      throw new AppError("El parametro orden debe ser 'recientes', 'antiguos', 'DESC' o 'ASC'.", 400);
    }
    return key === 'asc' || key === 'antiguos' ? 'antiguos' : 'recientes';
  }

  async getHistorialByUsuario(
    usuario_id,
    { tipo_accion = null, tipo = null, accion = null, fecha = null, fecha_inicio = null, fecha_fin = null, orden = 'recientes' } = {}
  ) {
    const tipoFinal = this.#normalizeTipoAccion(tipo_accion || tipo || accion);
    const fechaExacta = this.#validateDate(fecha, 'fecha');
    const fechaDesde = this.#validateDate(fecha_inicio, 'fecha_inicio');
    const fechaHasta = this.#validateDate(fecha_fin, 'fecha_fin');
    const ordenFinal = this.#normalizeOrden(orden);

    const historial = await this.#historialModel.findAllByUsuario(usuario_id, {
      tipo_accion: tipoFinal,
      fecha: fechaExacta,
      fecha_inicio: fechaDesde,
      fecha_fin: fechaHasta,
      orden: ordenFinal
    });

    return {
      filtros: {
        tipo_accion: tipoFinal,
        fecha: fechaExacta,
        fecha_inicio: fechaDesde,
        fecha_fin: fechaHasta,
        orden: ordenFinal
      },
      total: historial.length,
      historial
    };
  }
}

export const historialService = new HistorialService();

export default HistorialService;
