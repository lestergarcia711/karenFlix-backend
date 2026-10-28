import { ResenaService } from '../services/resena.service.js';

export const getResenasByPelicula = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resenas = await ResenaService.getResenasByPelicula(id);
    res.status(200).json({
      ok: true,
      data: {
        resenas
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createResena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, comentario, calificacion } = req.body;

    const resena = await ResenaService.createResena({
      pelicula_id: id,
      usuario_id: req.user.id,
      titulo,
      comentario,
      calificacion
    });

    res.status(201).json({
      ok: true,
      message: 'Resena creada exitosamente. La calificacion de la pelicula ha sido actualizada.',
      data: {
        resena
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateResena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, comentario, calificacion } = req.body;

    const resena = await ResenaService.updateResena(id, {
      usuario_id: req.user.id,
      titulo,
      comentario,
      calificacion
    });

    res.status(200).json({
      ok: true,
      message: 'Resena actualizada exitosamente. La calificacion de la pelicula ha sido recalculada.',
      data: {
        resena
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resena = await ResenaService.deleteResena(id, {
      usuario_id: req.user.id
    });

    res.status(200).json({
      ok: true,
      message: 'Resena eliminada exitosamente. La calificacion de la pelicula ha sido recalculada.',
      data: {
        resena
      }
    });
  } catch (error) {
    next(error);
  }
};
