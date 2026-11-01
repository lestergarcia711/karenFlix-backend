import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UsuarioModel, usuarioModel } from '../models/usuario.model.js';
import { AppError } from '../utils/AppError.js';

dotenv.config();

export class AuthService {
  #usuarioModel;
  #saltRounds;
  #jwtSecret;
  #jwtExpiresIn;
  #defaultRol;

  constructor(usuarioModelInstance = usuarioModel || new UsuarioModel()) {
    this.#usuarioModel = usuarioModelInstance;
    this.#saltRounds = 10;
    this.#jwtSecret = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
    this.#jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.#defaultRol = 'usuario';
  }

  #generateToken(usuario) {
    const payload = {
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol
    };

    return jwt.sign(payload, this.#jwtSecret, {
      expiresIn: this.#jwtExpiresIn
    });
  }

  async #hashPassword(contrasena) {
    return bcrypt.hash(contrasena, this.#saltRounds);
  }

  async #verifyPassword(contrasena, contrasenaHash) {
    return bcrypt.compare(contrasena, contrasenaHash);
  }

  #formatPublicUser(usuario) {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      fecha_creacion: usuario.fecha_creacion,
      fecha_actualizacion: usuario.fecha_actualizacion
    };
  }

  async register({ nombre, correo, contrasena }) {
    const existingUser = await this.#usuarioModel.findByEmail(correo);
    if (existingUser) {
      throw new AppError('El correo electronico ya se encuentra registrado.', 409);
    }

    const contrasenaHash = await this.#hashPassword(contrasena);

    try {
      const nuevoUsuario = await this.#usuarioModel.create({
        nombre,
        correo,
        contrasenaHash,
        rol: this.#defaultRol
      });

      const token = this.#generateToken(nuevoUsuario);

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
  }

  async login({ correo, contrasena }) {
    const usuario = await this.#usuarioModel.findByEmail(correo);
    if (!usuario) {
      throw new AppError('Credenciales invalidas: correo o contrasena incorrectos.', 401);
    }

    const isPasswordValid = await this.#verifyPassword(contrasena, usuario.contrasena_hash);
    if (!isPasswordValid) {
      throw new AppError('Credenciales invalidas: correo o contrasena incorrectos.', 401);
    }

    const usuarioPublico = this.#formatPublicUser(usuario);
    const token = this.#generateToken(usuarioPublico);

    return {
      usuario: usuarioPublico,
      token
    };
  }
}

export const authService = new AuthService();

export default AuthService;
