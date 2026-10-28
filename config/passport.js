import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import { UsuarioModel } from '../models/usuario.model.js';

dotenv.config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'clave_secreta_por_defecto'
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const usuario = await UsuarioModel.findById(payload.id);

      if (!usuario) {
        return done(null, false, { message: 'El usuario asociado al token no existe.' });
      }

      return done(null, usuario);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
