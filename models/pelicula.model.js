import pool from '../config/db.js';

export const PeliculaModel = {
  async findAllApproved() {
    const [rows] = await pool.execute(
      `SELECT 
         p.id,
         p.titulo,
         p.descripcion,
         p.tipo,
         p.categoria_id,
         c.nombre AS categoria_nombre,
         p.anio,
         p.imagen_url,
         p.estado,
         p.creado_por,
         u.nombre AS creador_nombre,
         p.promedio_calificacion,
         p.total_resenas,
         p.puntaje_ranking,
         p.fecha_creacion,
         p.fecha_actualizacion
       FROM peliculas p
       INNER JOIN categorias c ON p.categoria_id = c.id
       INNER JOIN usuarios u ON p.creado_por = u.id
       WHERE p.estado = 'aprobada'
       ORDER BY p.fecha_creacion DESC`
    );
    return rows;
  },

  async findAllForAdmin(estado = null) {
    let query = `
      SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.tipo,
        p.categoria_id,
        c.nombre AS categoria_nombre,
        p.anio,
        p.imagen_url,
        p.estado,
        p.creado_por,
        u.nombre AS creador_nombre,
        p.revisado_por,
        r.nombre AS revisor_nombre,
        p.fecha_revision,
        p.promedio_calificacion,
        p.total_resenas,
        p.puntaje_ranking,
        p.fecha_creacion,
        p.fecha_actualizacion
      FROM peliculas p
      INNER JOIN categorias c ON p.categoria_id = c.id
      INNER JOIN usuarios u ON p.creado_por = u.id
      LEFT JOIN usuarios r ON p.revisado_por = r.id
    `;
    const params = [];

    if (estado) {
      query += ` WHERE p.estado = ?`;
      params.push(estado);
    }

    query += ` ORDER BY p.fecha_creacion DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
         p.id,
         p.titulo,
         p.descripcion,
         p.tipo,
         p.categoria_id,
         c.nombre AS categoria_nombre,
         p.anio,
         p.imagen_url,
         p.estado,
         p.creado_por,
         u.nombre AS creador_nombre,
         p.revisado_por,
         r.nombre AS revisor_nombre,
         p.fecha_revision,
         p.promedio_calificacion,
         p.total_resenas,
         p.puntaje_ranking,
         p.fecha_creacion,
         p.fecha_actualizacion
       FROM peliculas p
       INNER JOIN categorias c ON p.categoria_id = c.id
       INNER JOIN usuarios u ON p.creado_por = u.id
       LEFT JOIN usuarios r ON p.revisado_por = r.id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByTitle(titulo) {
    const [rows] = await pool.execute(
      `SELECT id, titulo, estado
       FROM peliculas
       WHERE LOWER(titulo) = LOWER(?)
       LIMIT 1`,
      [titulo.trim()]
    );
    return rows[0] || null;
  },

  async create({
    titulo,
    descripcion,
    tipo = 'pelicula',
    categoria_id,
    anio,
    imagen_url = null,
    creado_por
  }) {
    const estadoInicial = 'pendiente';

    const [result] = await pool.execute(
      `INSERT INTO peliculas (
         titulo,
         descripcion,
         tipo,
         categoria_id,
         anio,
         imagen_url,
         estado,
         creado_por
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion,
        tipo,
        categoria_id,
        anio,
        imagen_url,
        estadoInicial,
        creado_por
      ]
    );

    return this.findById(result.insertId);
  },

  async updateStatus(id, { estado, revisado_por }) {
    await pool.execute(
      `UPDATE peliculas
       SET estado = ?, revisado_por = ?, fecha_revision = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [estado, revisado_por, id]
    );
    return this.findById(id);
  },

  async update(id, { titulo, descripcion, tipo, categoria_id, anio, imagen_url }) {
    await pool.execute(
      `UPDATE peliculas
       SET titulo = ?,
           descripcion = ?,
           tipo = ?,
           categoria_id = ?,
           anio = ?,
           imagen_url = ?
       WHERE id = ?`,
      [titulo, descripcion, tipo, categoria_id, anio, imagen_url, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.execute(
      `DELETE FROM peliculas
       WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
};

export default PeliculaModel;
