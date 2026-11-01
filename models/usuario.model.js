import pool from '../config/db.js';

export class UsuarioModel {
  #pool;
  #tableName;
  #defaultRol;

  constructor(dbPool = pool) {
    this.#pool = dbPool;
    this.#tableName = 'usuarios';
    this.#defaultRol = 'usuario';
  }

  #getFirstRowOrNull(rows) {
    return rows[0] || null;
  }

  #resolveRol(rol) {
    return rol || this.#defaultRol;
  }

  async findByEmail(correo) {
    const [rows] = await this.#pool.execute(
      `SELECT id, nombre, correo, contrasena_hash, rol, fecha_creacion, fecha_actualizacion
       FROM ${this.#tableName}
       WHERE correo = ?
       LIMIT 1`,
      [correo]
    );
    return this.#getFirstRowOrNull(rows);
  }

  async findById(id) {
    const [rows] = await this.#pool.execute(
      `SELECT id, nombre, correo, rol, fecha_creacion, fecha_actualizacion
       FROM ${this.#tableName}
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return this.#getFirstRowOrNull(rows);
  }

  async create({ nombre, correo, contrasenaHash, rol }) {
    const rolFinal = this.#resolveRol(rol);
    const [result] = await this.#pool.execute(
      `INSERT INTO ${this.#tableName} (nombre, correo, contrasena_hash, rol)
       VALUES (?, ?, ?, ?)`,
      [nombre, correo, contrasenaHash, rolFinal]
    );

    return this.findById(result.insertId);
  }
}

export const usuarioModel = new UsuarioModel();

export default UsuarioModel;
