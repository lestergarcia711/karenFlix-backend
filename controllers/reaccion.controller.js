import { ReaccionService } from '../services/reaccion.service.js';

export const reactToResena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;

    const resultado = await ReaccionService.reactToResena({
      resena_id: id,
      usuario_id: req.user.id,
      tipo
    });

    const mensajes = {
      creada: 'Reaccion registrada exitosamente.',
      actualizada: 'Reaccion actualizada exitosamente.',
      eliminada: 'Reaccion eliminada exitosamente.'
    };

    res.status(200).json({
      ok: true,
      message: mensajes[resultado.accion],
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

export const removeReaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resultado = await ReaccionService.removeReaction({
      resena_id: id,
      usuario_id: req.user.id
    });

    res.status(200).json({
      ok: true,
      message: 'Reaccion eliminada exitosamente.',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};
