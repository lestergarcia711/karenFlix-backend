import { body, param, validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { PeliculaModel } from '../models/pelicula.model.js';

export const handleValidationErrors = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      campo: err.path,
      mensaje: err.msg
    }));
    return next(new AppError('Error de validacion en los datos enviados.', 400, formattedErrors));
  }
  return next();
};

export const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 60 })
    .withMessage('El nombre debe tener entre 2 y 60 caracteres.'),
  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo electronico es obligatorio.')
    .isEmail()
    .withMessage('Debe proporcionar un correo electronico valido.')
    .isLength({ max: 120 })
    .withMessage('El correo electronico no puede superar los 120 caracteres.')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty()
    .withMessage('La contrasena es obligatoria.')
    .isLength({ min: 6, max: 100 })
    .withMessage('La contrasena debe tener al menos 6 caracteres.'),
  handleValidationErrors
];

export const validateLogin = [
  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo electronico es obligatorio.')
    .isEmail()
    .withMessage('Debe proporcionar un correo electronico valido.')
    .normalizeEmail(),
  body('contrasena')
    .notEmpty()
    .withMessage('La contrasena es obligatoria.'),
  handleValidationErrors
];

export const validateCategoryId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El identificador de la categoria debe ser un numero entero positivo.'),
  handleValidationErrors
];

export const validateCategory = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la categoria es obligatorio.')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre de la categoria debe tener entre 2 y 50 caracteres.'),
  body('descripcion')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripcion no puede superar los 255 caracteres.'),
  handleValidationErrors
];

export const validatePelicula = [
  body('titulo')
    .trim()
    .notEmpty()
    .withMessage('El titulo de la pelicula o serie es obligatorio.')
    .isLength({ min: 1, max: 150 })
    .withMessage('El titulo debe tener entre 1 y 150 caracteres.')
    .custom(async (titulo) => {
      const existing = await PeliculaModel.findByTitle(titulo);
      if (existing) {
        throw new Error('Ya existe una pelicula o serie registrada con ese titulo.');
      }
      return true;
    }),
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripcion es obligatoria.'),
  body('tipo')
    .optional()
    .trim()
    .isIn(['pelicula', 'serie', 'anime'])
    .withMessage("El tipo debe ser 'pelicula', 'serie' o 'anime'."),
  body('categoria_id')
    .customSanitizer((value, { req }) => value ?? req.body.categoria)
    .notEmpty()
    .withMessage('La categoria es obligatoria.')
    .isInt({ min: 1 })
    .withMessage('El identificador de la categoria debe ser un numero entero positivo.')
    .toInt(),
  body('anio')
    .notEmpty()
    .withMessage('El anio de estreno es obligatorio.')
    .isInt({ min: 1888, max: 2100 })
    .withMessage('El anio debe ser un numero entero valido entre 1888 y 2100.')
    .toInt(),
  body('imagen_url')
    .customSanitizer((value, { req }) => value ?? req.body.imagen ?? null)
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('La imagen debe ser una URL valida.')
    .isLength({ max: 500 })
    .withMessage('La URL de la imagen no puede superar los 500 caracteres.'),
  handleValidationErrors
];

export const validatePeliculaId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El identificador de la pelicula debe ser un numero entero positivo.')
    .toInt(),
  handleValidationErrors
];

export const validatePeliculaStatus = [
  body('estado')
    .trim()
    .notEmpty()
    .withMessage('El estado de revision es obligatorio.')
    .isIn(['aprobada', 'rechazada'])
    .withMessage("El estado de revision debe ser 'aprobada' o 'rechazada'."),
  handleValidationErrors
];

export const validateUpdatePelicula = [
  body('titulo')
    .trim()
    .notEmpty()
    .withMessage('El titulo de la pelicula o serie es obligatorio.')
    .isLength({ min: 1, max: 150 })
    .withMessage('El titulo debe tener entre 1 y 150 caracteres.')
    .custom(async (titulo, { req }) => {
      const existing = await PeliculaModel.findByTitle(titulo);
      if (existing && Number(existing.id) !== Number(req.params.id)) {
        throw new Error('Ya existe otra pelicula o serie registrada con ese titulo.');
      }
      return true;
    }),
  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripcion es obligatoria.'),
  body('tipo')
    .optional()
    .trim()
    .isIn(['pelicula', 'serie', 'anime'])
    .withMessage("El tipo debe ser 'pelicula', 'serie' o 'anime'."),
  body('categoria_id')
    .customSanitizer((value, { req }) => value ?? req.body.categoria)
    .notEmpty()
    .withMessage('La categoria es obligatoria.')
    .isInt({ min: 1 })
    .withMessage('El identificador de la categoria debe ser un numero entero positivo.')
    .toInt(),
  body('anio')
    .notEmpty()
    .withMessage('El anio de estreno es obligatorio.')
    .isInt({ min: 1888, max: 2100 })
    .withMessage('El anio debe ser un numero entero valido entre 1888 y 2100.')
    .toInt(),
  body('imagen_url')
    .customSanitizer((value, { req }) => value ?? req.body.imagen ?? null)
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('La imagen debe ser una URL valida.')
    .isLength({ max: 500 })
    .withMessage('La URL de la imagen no puede superar los 500 caracteres.'),
  handleValidationErrors
];

export const validateResenaId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El identificador de la resena debe ser un numero entero positivo.')
    .toInt(),
  handleValidationErrors
];

export const validateResena = [
  body('titulo')
    .trim()
    .notEmpty()
    .withMessage('El titulo de la resena es obligatorio.')
    .isLength({ min: 2, max: 100 })
    .withMessage('El titulo de la resena debe tener entre 2 y 100 caracteres.'),
  body('comentario')
    .trim()
    .notEmpty()
    .withMessage('El comentario de la resena es obligatorio.'),
  body('calificacion')
    .customSanitizer((value, { req }) => value ?? req.body.nota)
    .notEmpty()
    .withMessage('La calificacion es obligatoria.')
    .isInt({ min: 1, max: 10 })
    .withMessage('La calificacion debe ser un numero entero entre 1 y 10.')
    .toInt(),
  handleValidationErrors
];
