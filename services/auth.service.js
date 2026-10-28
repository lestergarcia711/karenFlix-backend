import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UsuarioModel } from '../models/usuario.model.js';
import { AppError } from '../utils/AppError.js';

dotenv.config();

const SALT_ROUNDS = 10;

const generateToken = (usuario) => {
  const payload = {
    id: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'clave_secreta_por_defecto', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

export const AuthService = {
  async register({ nombre, correo, contrasena }) {
    const existingUser = await UsuarioModel.findByEmail(correo);
    if (existingUser) {
      throw new AppError('El correo electronico ya se encuentra registrado.', 409);
    }

    const contrasenaHash = await bcrypt.hash(contrasena, SALT_ROUNDS);

    try {
      const nuevoUsuario = await UsuarioModel.create({
        nombre,
        correo,
        contrasenaHash,
        rol: 'usuario'
      });

      const token = generateToken(nuevoUsuario);

      return {
        usuario: nuevoUsuario,
        token
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('El correo electronico ya se encuentra registrado.', 409);
      }
      throw error;
    }
  },

  async login({ correo, contrasena }) {
    const usuario = await UsuarioModel.findByEmail(correo);
    if (!usuario) {
      throw new AppError('Credenciales invalidas: correo o contrasena incorrectos.', 401);
    }

    const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!isPasswordValid) {
      throw new AppError('Credenciales invalidas: correo o contrasena incorrectos.', 401);
    }

    const usuarioPublico = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      fecha_creacion: usuario.fecha_creacion,
      fecha_actualizacion: usuario.fecha_actualizacion
    };

    const token = generateToken(usuarioPublico);

    return {
      usuario: usuarioPublico,
      token
    };
  }
};

export default AuthService;
