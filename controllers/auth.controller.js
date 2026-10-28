import { AuthService } from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { nombre, correo, contrasena } = req.body;
    const resultado = await AuthService.register({ nombre, correo, contrasena });

    res.status(201).json({
      ok: true,
      message: 'Usuario registrado exitosamente.',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;
    const resultado = await AuthService.login({ correo, contrasena });

    res.status(200).json({
      ok: true,
      message: 'Inicio de sesion exitoso.',
      data: resultado
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      ok: true,
      data: {
        usuario: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};
