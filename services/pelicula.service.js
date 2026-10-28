import { PeliculaModel } from '../models/pelicula.model.js';
import { CategoriaModel } from '../models/categoria.model.js';
import { AppError } from '../utils/AppError.js';

export const PeliculaService = {
  async createPelicula({
    titulo,
    descripcion,
    tipo = 'pelicula',
    categoria_id,
    anio,
    imagen_url = null,
    creado_por
  }) {
    const categoria = await CategoriaModel.findById(categoria_id);
    if (!categoria) {
      throw new AppError('La categoria seleccionada no existe.', 404);
    }

    const existingTitle = await PeliculaModel.findByTitle(titulo);
    if (existingTitle) {
      throw new AppError('Ya existe una pelicula o serie registrada con ese titulo.', 409);
    }

    try {
      return await PeliculaModel.create({
        titulo,
        descripcion,
        tipo: tipo || 'pelicula',
        categoria_id,
        anio,
        imagen_url: imagen_url || null,
        creado_por
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Ya existe una pelicula o serie registrada con ese titulo.', 409);
      }
      throw error;
    }
  }
};

export default PeliculaService;
