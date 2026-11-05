import { categoriaService } from '../services/categoria.service.js';

export class CategoriaController {
  #categoriaService;

  constructor(categoriaServiceInstance = categoriaService) {
    this.#categoriaService = categoriaServiceInstance;

    this.getAllCategories = this.getAllCategories.bind(this);
    this.getCategoryById = this.getCategoryById.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
  }

  #sendSuccess(res, statusCode, data, message = null) {
    const payload = { ok: true };
    if (message) {
      payload.message = message;
    }
    payload.data = data;
    return res.status(statusCode).json(payload);
  }

  async getAllCategories(_req, res, next) {
    try {
      const categorias = await this.#categoriaService.getAllCategories();
      return this.#sendSuccess(res, 200, { categorias });
    } catch (error) {
      return next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await this.#categoriaService.getCategoryById(id);
      return this.#sendSuccess(res, 200, { categoria });
    } catch (error) {
      return next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const { nombre, descripcion } = req.body;
      const categoria = await this.#categoriaService.createCategory({ nombre, descripcion });
      return this.#sendSuccess(
        res,
        201,
        { categoria },
        'Categoria creada exitosamente.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;
      const categoria = await this.#categoriaService.updateCategory(id, { nombre, descripcion });
      return this.#sendSuccess(
        res,
        200,
        { categoria },
        'Categoria actualizada exitosamente.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await this.#categoriaService.deleteCategory(id);
      return this.#sendSuccess(
        res,
        200,
        { categoria },
        'Categoria eliminada exitosamente.'
      );
    } catch (error) {
      return next(error);
    }
  }
}

export const categoriaController = new CategoriaController();

export default CategoriaController;
