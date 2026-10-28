import pool from '../config/db.js';

export const UsuarioModel = {
  async findByEmail(correo) {
    const [rows] = await pool.execute(
      `SELECT id, nombre, correo, contrasena_hash, rol, fecha_creacion, fecha_actualizacion
       FROM usuarios
       WHERE correo = ?
       LIMIT 1`,
      [correo]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, nombre, correo, rol, fecha_creacion, fecha_actualizacion
       FROM usuarios
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ nombre, correo, contrasenaHash, rol = 'usuario' }) {
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre, correo, contrasena_hash, rol)
       VALUES (?, ?, ?, ?)`,
      [nombre, correo, contrasenaHash, rol]
    );

    return this.findById(result.insertId);
  }
};

export default UsuarioModel;
