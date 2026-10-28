import { PeliculaService } from '../services/pelicula.service.js';

export const getApprovedPeliculas = async (req, res, next) => {
  try {
    const { categoria_id, categoria, tipo, busqueda, orden } = req.query;
    const peliculas = await PeliculaService.getApprovedPeliculas({
      categoria_id: categoria_id ?? categoria,
      tipo,
      busqueda,
      orden
    });
    res.status(200).json({
      ok: true,
      data: {
        peliculas
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRankingPeliculas = async (req, res, next) => {
  try {
    const { orden, categoria_id, categoria, limite } = req.query;
    const ranking = await PeliculaService.getRankingPeliculas({
      orden,
      categoria_id: categoria_id ?? categoria,
      limite
    });
    res.status(200).json({
      ok: true,
      data: {
        criterio: orden === 'popularidad' ? 'popularidad' : 'ranking',
        ranking
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPeliculaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const detalle = await PeliculaService.getPeliculaDetail(id);
    res.status(200).json({
      ok: true,
      data: detalle
    });
  } catch (error) {
    next(error);
  }
};

export const getPeliculasForAdmin = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const peliculas = await PeliculaService.getPeliculasForAdmin(estado);
    res.status(200).json({
      ok: true,
      data: {
        peliculas
      }
    });
  } catch (error) {
    next(error);
  }
};

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

export const reviewPelicula = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const pelicula = await PeliculaService.reviewPelicula(id, {
      estado,
      revisado_por: req.user.id
    });

    res.status(200).json({
      ok: true,
      message: `Pelicula o serie ${estado} exitosamente.`,
      data: {
        pelicula
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePelicula = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, tipo, categoria_id, anio, imagen_url } = req.body;
    const pelicula = await PeliculaService.updatePelicula(id, {
      titulo,
      descripcion,
      tipo,
      categoria_id,
      anio,
      imagen_url
    });

    res.status(200).json({
      ok: true,
      message: 'Pelicula o serie actualizada exitosamente.',
      data: {
        pelicula
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deletePelicula = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pelicula = await PeliculaService.deletePelicula(id);

    res.status(200).json({
      ok: true,
      message: 'Pelicula o serie eliminada exitosamente.',
      data: {
        pelicula
      }
    });
  } catch (error) {
    next(error);
  }
};
