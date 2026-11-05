import pool from '../config/db.js';

export class HistorialModel {
  #pool;

  constructor(dbPool = pool) {
    this.#pool = dbPool;
  }

  async createWithConnection(
    connection,
    { usuario_id, pelicula_id = null, resena_id = null, tipo_accion, resena_titulo = null, calificacion = null, descripcion }
  ) {
    const db = connection || this.#pool;
    const [result] = await db.execute(
      `INSERT INTO historial (
         usuario_id,
         pelicula_id,
         resena_id,
         tipo_accion,
         resena_titulo,
         calificacion,
         descripcion
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [usuario_id, pelicula_id, resena_id, tipo_accion, resena_titulo, calificacion, descripcion]
    );
    return result.insertId;
  }

  async findAllByUsuario(
    usuario_id,
    { tipo_accion = null, fecha = null, fecha_inicio = null, fecha_fin = null, orden = 'recientes' } = {}
  ) {
    let query = `
      SELECT 
        h.id,
        h.usuario_id,
        u.nombre AS usuario_nombre,
        h.pelicula_id,
        p.titulo AS pelicula_titulo,
        h.resena_id,
        h.tipo_accion,
        h.resena_titulo,
        h.calificacion,
        h.descripcion,
        h.fecha_creacion
      FROM historial h
      INNER JOIN usuarios u ON h.usuario_id = u.id
      LEFT JOIN peliculas p ON h.pelicula_id = p.id
      WHERE h.usuario_id = ?
    `;
    const params = [usuario_id];

    if (tipo_accion) {
      query += ` AND h.tipo_accion = ?`;
      params.push(tipo_accion);
    }

    if (fecha) {
      query += ` AND DATE(h.fecha_creacion) = ?`;
      params.push(fecha);
    }

    if (fecha_inicio) {
      query += ` AND DATE(h.fecha_creacion) >= ?`;
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ` AND DATE(h.fecha_creacion) <= ?`;
      params.push(fecha_fin);
    }

    const sortAsc = orden === 'antiguos' || String(orden).toUpperCase() === 'ASC';
    query += sortAsc
      ? ` ORDER BY h.fecha_creacion ASC, h.id ASC`
      : ` ORDER BY h.fecha_creacion DESC, h.id DESC`;

    const [rows] = await this.#pool.execute(query, params);
    return rows;
  }
}

export const historialModel = new HistorialModel();

export default HistorialModel;
