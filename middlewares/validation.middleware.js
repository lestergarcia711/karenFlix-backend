import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

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
