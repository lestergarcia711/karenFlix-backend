import { PeliculaService } from '../services/pelicula.service.js';

export const createPelicula = async (req, res, next) => {
  try {
    const {
      titulo,
      descripcion,
      tipo,
      categoria_id,
      anio,
      imagen_url
    } = req.body;

    const pelicula = await PeliculaService.createPelicula({
      titulo,
      descripcion,
      tipo,
      categoria_id,
      anio,
      imagen_url,
      creado_por: req.user.id
    });

    res.status(201).json({
      ok: true,
      message: 'Pelicula o serie agregada exitosamente. Quedara en estado pendiente hasta que un administrador la revise.',
      data: {
        pelicula
      }
    });
  } catch (error) {
    next(error);
  }
};
