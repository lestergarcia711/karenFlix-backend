import pool from '../config/db.js';

export class CategoriaModel {
  #pool;
  #tableName;
  #selectColumns;

  constructor(dbPool = pool) {
    this.#pool = dbPool;
    this.#tableName = 'categorias';
    this.#selectColumns = 'id, nombre, descripcion, fecha_creacion, fecha_actualizacion';
  }

  #getFirstRowOrNull(rows) {
    return rows[0] || null;
  }

  #normalizeDescripcion(descripcion) {
    return descripcion ?? null;
  }

  async findAll() {
    const [rows] = await this.#pool.execute(
      `SELECT ${this.#selectColumns}
       FROM ${this.#tableName}
       ORDER BY nombre ASC`
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await this.#pool.execute(
      `SELECT ${this.#selectColumns}
       FROM ${this.#tableName}
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return this.#getFirstRowOrNull(rows);
  }

  async findByName(nombre) {
    const [rows] = await this.#pool.execute(
      `SELECT ${this.#selectColumns}
       FROM ${this.#tableName}
       WHERE nombre = ?
       LIMIT 1`,
      [nombre]
    );
    return this.#getFirstRowOrNull(rows);
  }

  async create({ nombre, descripcion = null }) {
    const [result] = await this.#pool.execute(
      `INSERT INTO ${this.#tableName} (nombre, descripcion)
       VALUES (?, ?)`,
      [nombre, this.#normalizeDescripcion(descripcion)]
    );
    return this.findById(result.insertId);
  }

  async update(id, { nombre, descripcion = null }) {
    await this.#pool.execute(
      `UPDATE ${this.#tableName}
       SET nombre = ?, descripcion = ?
       WHERE id = ?`,
      [nombre, this.#normalizeDescripcion(descripcion), id]
    );
    return this.findById(id);
  }

  async remove(id) {
    const [result] = await this.#pool.execute(
      `DELETE FROM ${this.#tableName}
       WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

export const categoriaModel = new CategoriaModel();

export default CategoriaModel;
