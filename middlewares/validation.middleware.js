import { body, param, query, validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';
import { peliculaModel } from '../models/pelicula.model.js';

export class ValidationMiddleware {
  #peliculaModel;
  #tiposValidos;
  #ordenesValidos;
  #estadosRevisionValidos;
  #reaccionesValidas;
  #minAnio;
  #maxAnio;

  constructor(peliculaModelInstance = peliculaModel) {
    this.#peliculaModel = peliculaModelInstance;
    this.#tiposValidos = ['pelicula', 'serie', 'anime'];
    this.#ordenesValidos = ['ranking', 'popularidad', 'recientes'];
    this.#estadosRevisionValidos = ['aprobada', 'rechazada'];
    this.#reaccionesValidas = ['like', 'dislike'];
    this.#minAnio = 1888;
    this.#maxAnio = 2100;

    this.handleValidationErrors = this.handleValidationErrors.bind(this);
  }

  #formatErrors(errors) {
    return errors.array().map((err) => ({
      campo: err.path,
      mensaje: err.msg
    }));
  }

  async #validateUniquePeliculaTitle(titulo, excludeId = null) {
    const existing = await this.#peliculaModel.findByTitle(titulo);
    if (!existing) {
      return true;
    }

    if (excludeId === null) {
      throw new Error('Ya existe una pelicula o serie registrada con ese titulo.');
    }

    if (Number(existing.id) !== Number(excludeId)) {
      throw new Error('Ya existe otra pelicula o serie registrada con ese titulo.');
    }

    return true;
  }

  #buildPeliculaBodyRules(isUpdate = false) {
    return [
      body('titulo')
        .trim()
        .notEmpty()
        .withMessage('El titulo de la pelicula o serie es obligatorio.')
        .isLength({ min: 1, max: 150 })
        .withMessage('El titulo debe tener entre 1 y 150 caracteres.')
        .custom(async (titulo, { req }) =>
          this.#validateUniquePeliculaTitle(titulo, isUpdate ? req.params.id : null)
        ),
      body('descripcion')
        .trim()
        .notEmpty()
        .withMessage('La descripcion es obligatoria.'),
      body('tipo')
        .optional()
        .trim()
        .isIn(this.#tiposValidos)
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
        .isInt({ min: this.#minAnio, max: this.#maxAnio })
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
      this.handleValidationErrors
    ];
  }

  handleValidationErrors(req, _res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = this.#formatErrors(errors);
      return next(new AppError('Error de validacion en los datos enviados.', 400, formattedErrors));
    }
    return next();
  }

  getRegisterValidator() {
    return [
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
      this.handleValidationErrors
    ];
  }

  getLoginValidator() {
    return [
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
      this.handleValidationErrors
    ];
  }

  getCategoryIdValidator() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('El identificador de la categoria debe ser un numero entero positivo.'),
      this.handleValidationErrors
    ];
  }

  getCategoryValidator() {
    return [
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
      this.handleValidationErrors
    ];
  }

  getPeliculaValidator() {
    return this.#buildPeliculaBodyRules(false);
  }

  getPeliculaIdValidator() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('El identificador de la pelicula debe ser un numero entero positivo.')
        .toInt(),
      this.handleValidationErrors
    ];
  }

  getPeliculaStatusValidator() {
    return [
      body('estado')
        .trim()
        .notEmpty()
        .withMessage('El estado de revision es obligatorio.')
        .isIn(this.#estadosRevisionValidos)
        .withMessage("El estado de revision debe ser 'aprobada' o 'rechazada'."),
      this.handleValidationErrors
    ];
  }

  getUpdatePeliculaValidator() {
    return this.#buildPeliculaBodyRules(true);
  }

  getResenaIdValidator() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('El identificador de la resena debe ser un numero entero positivo.')
        .toInt(),
      this.handleValidationErrors
    ];
  }

  getResenaValidator() {
    return [
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
      this.handleValidationErrors
    ];
  }

  getReaccionValidator() {
    return [
      body('tipo')
        .trim()
        .notEmpty()
        .withMessage('El tipo de reaccion es obligatorio.')
        .isIn(this.#reaccionesValidas)
        .withMessage("El tipo de reaccion debe ser 'like' o 'dislike'."),
      this.handleValidationErrors
    ];
  }

  getPeliculaQueryValidator() {
    return [
      query('categoria_id')
        .customSanitizer((value, { req }) => value ?? req.query.categoria)
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('El filtro categoria_id debe ser un numero entero positivo.')
        .toInt(),
      query('tipo')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isIn(this.#tiposValidos)
        .withMessage("El filtro tipo debe ser 'pelicula', 'serie' o 'anime'."),
      query('orden')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isIn(this.#ordenesValidos)
        .withMessage("El parametro orden debe ser 'ranking', 'popularidad' o 'recientes'."),
      query('limite')
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1, max: 100 })
        .withMessage('El parametro limite debe ser un numero entero entre 1 y 100.')
        .toInt(),
      this.handleValidationErrors
    ];
  }
}

export const validationMiddleware = new ValidationMiddleware();

export default ValidationMiddleware;
