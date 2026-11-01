import { ReaccionModel, reaccionModel } from '../models/reaccion.model.js';
import { ResenaModel, resenaModel } from '../models/resena.model.js';
import { AppError } from '../utils/AppError.js';

export class ReaccionService {
  #reaccionModel;
  #resenaModel;

  constructor(
    reaccionModelInstance = reaccionModel || new ReaccionModel(),
    resenaModelInstance = resenaModel || new ResenaModel()
  ) {
    this.#reaccionModel = reaccionModelInstance;
    this.#resenaModel = resenaModelInstance;
  }

  async #findResenaOrFail(resena_id) {
    const resena = await this.#resenaModel.findById(resena_id);
    if (!resena) {
      throw new AppError('La resena solicitada no existe.', 404);
    }
    return resena;
  }

  #ensureNotOwnResena(resena, usuario_id) {
    if (Number(resena.usuario_id) === Number(usuario_id)) {
      throw new AppError('No puedes reaccionar a tus propias resenas.', 403);
    }
  }

  async reactToResena({ resena_id, usuario_id, tipo }) {
    const resena = await this.#findResenaOrFail(resena_id);
    this.#ensureNotOwnResena(resena, usuario_id);

    return this.#reaccionModel.upsertOrToggleWithTransaction({
      resena_id,
      pelicula_id: resena.pelicula_id,
      usuario_id,
      tipo
    });
  }

  async removeReaction({ resena_id, usuario_id }) {
    const resena = await this.#findResenaOrFail(resena_id);

    const existing = await this.#reaccionModel.findByResenaAndUsuario(resena_id, usuario_id);
    if (!existing) {
      throw new AppError('No tienes una reaccion registrada en esta resena.', 404);
    }

    const resenaActualizada = await this.#reaccionModel.removeWithTransaction({
      resena_id,
      pelicula_id: resena.pelicula_id,
      reaccion_id: existing.id
    });

    return {
      resena: resenaActualizada
    };
  }
}

export const reaccionService = new ReaccionService();

export default ReaccionService;
