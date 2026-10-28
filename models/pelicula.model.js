import pool from '../config/db.js';

export const PeliculaModel = {
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
         p.fecha_revision,
         p.promedio_calificacion,
         p.total_resenas,
         p.puntaje_ranking,
         p.fecha_creacion,
         p.fecha_actualizacion
       FROM peliculas p
       INNER JOIN categorias c ON p.categoria_id = c.id
       INNER JOIN usuarios u ON p.creado_por = u.id
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
  }
};

export default PeliculaModel;
