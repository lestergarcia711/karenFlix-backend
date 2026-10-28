import { ReaccionModel } from '../models/reaccion.model.js';
import { ResenaModel } from '../models/resena.model.js';
import { AppError } from '../utils/AppError.js';

export const ReaccionService = {
  async reactToResena({ resena_id, usuario_id, tipo }) {
    const resena = await ResenaModel.findById(resena_id);
    if (!resena) {
      throw new AppError('La resena solicitada no existe.', 404);
    }

    if (Number(resena.usuario_id) === Number(usuario_id)) {
      throw new AppError('No puedes reaccionar a tus propias resenas.', 403);
    }

    return ReaccionModel.upsertOrToggleWithTransaction({
      resena_id,
      pelicula_id: resena.pelicula_id,
      usuario_id,
      tipo
    });
  },

  async removeReaction({ resena_id, usuario_id }) {
    const resena = await ResenaModel.findById(resena_id);
    if (!resena) {
      throw new AppError('La resena solicitada no existe.', 404);
    }

    const existing = await ReaccionModel.findByResenaAndUsuario(resena_id, usuario_id);
    if (!existing) {
      throw new AppError('No tienes una reaccion registrada en esta resena.', 404);
    }

    const resenaActualizada = await ReaccionModel.removeWithTransaction({
      resena_id,
      pelicula_id: resena.pelicula_id,
      reaccion_id: existing.id
    });

    return {
      resena: resenaActualizada
    };
  }
};

export default ReaccionService;
