import pool from '../config/db.js';

export const CategoriaModel = {
  async findAll() {
    const [rows] = await pool.execute(
      `SELECT id, nombre, descripcion, fecha_creacion, fecha_actualizacion
       FROM categorias
       ORDER BY nombre ASC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, nombre, descripcion, fecha_creacion, fecha_actualizacion
       FROM categorias
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByName(nombre) {
    const [rows] = await pool.execute(
      `SELECT id, nombre, descripcion, fecha_creacion, fecha_actualizacion
       FROM categorias
       WHERE nombre = ?
       LIMIT 1`,
      [nombre]
    );
    return rows[0] || null;
  },

  async create({ nombre, descripcion = null }) {
    const [result] = await pool.execute(
      `INSERT INTO categorias (nombre, descripcion)
       VALUES (?, ?)`,
      [nombre, descripcion]
    );
    return this.findById(result.insertId);
  },

  async update(id, { nombre, descripcion = null }) {
    await pool.execute(
      `UPDATE categorias
       SET nombre = ?, descripcion = ?
       WHERE id = ?`,
      [nombre, descripcion, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.execute(
      `DELETE FROM categorias
       WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
};

export default CategoriaModel;
