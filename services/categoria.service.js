import { CategoriaModel } from '../models/categoria.model.js';
import { AppError } from '../utils/AppError.js';

export const CategoriaService = {
  async getAllCategories() {
    return CategoriaModel.findAll();
  },

  async getCategoryById(id) {
    const categoria = await CategoriaModel.findById(id);
    if (!categoria) {
      throw new AppError('La categoria solicitada no existe.', 404);
    }
    return categoria;
  },

  async createCategory({ nombre, descripcion }) {
    const existing = await CategoriaModel.findByName(nombre);
    if (existing) {
      throw new AppError('Ya existe una categoria con ese nombre.', 409);
    }

    try {
      return await CategoriaModel.create({
        nombre,
        descripcion: descripcion ?? null
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Ya existe una categoria con ese nombre.', 409);
      }
      throw error;
    }
  },

  async updateCategory(id, { nombre, descripcion }) {
    const currentCategory = await CategoriaModel.findById(id);
    if (!currentCategory) {
      throw new AppError('La categoria solicitada no existe.', 404);
    }

    const existingWithName = await CategoriaModel.findByName(nombre);
    if (existingWithName && Number(existingWithName.id) !== Number(id)) {
      throw new AppError('Ya existe otra categoria con ese nombre.', 409);
    }

    try {
      return await CategoriaModel.update(id, {
        nombre,
        descripcion: descripcion !== undefined ? descripcion : currentCategory.descripcion
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Ya existe otra categoria con ese nombre.', 409);
      }
      throw error;
    }
  },

  async deleteCategory(id) {
    const currentCategory = await CategoriaModel.findById(id);
    if (!currentCategory) {
      throw new AppError('La categoria solicitada no existe.', 404);
    }

    try {
      await CategoriaModel.remove(id);
      return currentCategory;
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
        throw new AppError(
          'No se puede eliminar la categoria porque tiene peliculas asociadas.',
          409
        );
      }
      throw error;
    }
  }
};

export default CategoriaService;
