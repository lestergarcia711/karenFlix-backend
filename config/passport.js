import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import { UsuarioModel } from '../models/usuario.model.js';

dotenv.config();

export class PassportConfig {
  #passport;
  #usuarioModel;
  #jwtSecret;

  constructor(passportInstance = passport, usuarioModelInstance = new UsuarioModel()) {
    this.#passport = passportInstance;
    this.#usuarioModel = usuarioModelInstance;
    this.#jwtSecret = process.env.JWT_SECRET || 'clave_secreta_por_defecto';

    this.#configureJwtStrategy();
  }

  #buildJwtOptions() {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.#jwtSecret
    };
  }

  async #verifyJwtPayload(payload, done) {
    try {
      const usuario = await this.#usuarioModel.findById(payload.id);

      if (!usuario) {
        return done(null, false, { message: 'El usuario asociado al token no existe.' });
      }

      return done(null, usuario);
    } catch (error) {
      return done(error, false);
    }
  }

  #configureJwtStrategy() {
    const options = this.#buildJwtOptions();
    this.#passport.use(
      new JwtStrategy(options, (payload, done) => this.#verifyJwtPayload(payload, done))
    );
  }

  initialize() {
    return this.#passport.initialize();
  }

  getPassport() {
    return this.#passport;
  }
}

export const passportConfig = new PassportConfig();

export default passportConfig.getPassport();
