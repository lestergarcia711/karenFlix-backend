import { CategoriaModel, categoriaModel } from '../models/categoria.model.js';
import { AppError } from '../utils/AppError.js';

export class CategoriaService {
  #categoriaModel;

  constructor(categoriaModelInstance = categoriaModel || new CategoriaModel()) {
    this.#categoriaModel = categoriaModelInstance;
  }

  async #findCategoryOrFail(id) {
    const categoria = await this.#categoriaModel.findById(id);
    if (!categoria) {
      throw new AppError('La categoria solicitada no existe.', 404);
    }
    return categoria;
  }

  async #ensureUniqueCategoryName(nombre, excludeId = null) {
    const existing = await this.#categoriaModel.findByName(nombre);
    if (!existing) {
      return;
    }

    if (excludeId === null) {
      throw new AppError('Ya existe una categoria con ese nombre.', 409);
    }

    if (Number(existing.id) !== Number(excludeId)) {
      throw new AppError('Ya existe otra categoria con ese nombre.', 409);
    }
  }

  #handleWriteError(error, duplicateMessage) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(duplicateMessage, 409);
    }
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      throw new AppError(
        'No se puede eliminar la categoria porque tiene peliculas asociadas.',
        409
      );
    }
    throw error;
  }

  async getAllCategories() {
    return this.#categoriaModel.findAll();
  }

  async getCategoryById(id) {
    return this.#findCategoryOrFail(id);
  }

  async createCategory({ nombre, descripcion }) {
    await this.#ensureUniqueCategoryName(nombre);

    try {
      return await this.#categoriaModel.create({
        nombre,
        descripcion: descripcion ?? null
      });
    } catch (error) {
      this.#handleWriteError(error, 'Ya existe una categoria con ese nombre.');
    }
  }

  async updateCategory(id, { nombre, descripcion }) {
    const currentCategory = await this.#findCategoryOrFail(id);
    await this.#ensureUniqueCategoryName(nombre, id);

    try {
      return await this.#categoriaModel.update(id, {
        nombre,
        descripcion: descripcion !== undefined ? descripcion : currentCategory.descripcion
      });
    } catch (error) {
      this.#handleWriteError(error, 'Ya existe otra categoria con ese nombre.');
    }
  }

  async deleteCategory(id) {
    const currentCategory = await this.#findCategoryOrFail(id);

    try {
      await this.#categoriaModel.remove(id);
      return currentCategory;
    } catch (error) {
      this.#handleWriteError(error);
    }
  }
}

export const categoriaService = new CategoriaService();

export default CategoriaService;
