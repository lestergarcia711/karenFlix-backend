import { CategoriaService } from '../services/categoria.service.js';

export const getAllCategories = async (_req, res, next) => {
  try {
    const categorias = await CategoriaService.getAllCategories();
    res.status(200).json({
      ok: true,
      data: {
        categorias
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaService.getCategoryById(id);
    res.status(200).json({
      ok: true,
      data: {
        categoria
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const categoria = await CategoriaService.createCategory({ nombre, descripcion });
    res.status(201).json({
      ok: true,
      message: 'Categoria creada exitosamente.',
      data: {
        categoria
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const categoria = await CategoriaService.updateCategory(id, { nombre, descripcion });
    res.status(200).json({
      ok: true,
      message: 'Categoria actualizada exitosamente.',
      data: {
        categoria
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaService.deleteCategory(id);
    res.status(200).json({
      ok: true,
      message: 'Categoria eliminada exitosamente.',
      data: {
        categoria
      }
    });
  } catch (error) {
    next(error);
  }
};
