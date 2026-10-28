import pool from '../config/db.js';

export const ResenaModel = {
  async recalculatePeliculaStats(connection, pelicula_id) {
    const [statsRows] = await connection.execute(
      `SELECT 
         COUNT(*) AS total_resenas,
         COALESCE(ROUND(AVG(calificacion), 2), 0.00) AS promedio_calificacion,
         COALESCE(
           ROUND(
             AVG(
               calificacion
               + ((CAST(total_likes AS SIGNED) - CAST(total_dislikes AS SIGNED)) * 0.15)
               + (1.0 / (1.0 + GREATEST(TIMESTAMPDIFF(DAY, fecha_creacion, NOW()), 0) / 30.0))
             ),
             4
           ),
           0.0000
         ) AS puntaje_ranking
       FROM resenas
       WHERE pelicula_id = ?`,
      [pelicula_id]
    );

    const { total_resenas, promedio_calificacion, puntaje_ranking } = statsRows[0];

    await connection.execute(
      `UPDATE peliculas
       SET promedio_calificacion = ?,
           total_resenas = ?,
           puntaje_ranking = ?
       WHERE id = ?`,
      [promedio_calificacion, total_resenas, puntaje_ranking, pelicula_id]
    );
  },

  async findById(id, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT 
         r.id,
         r.pelicula_id,
         p.titulo AS pelicula_titulo,
         r.usuario_id,
         u.nombre AS autor_nombre,
         r.titulo,
         r.comentario,
         r.calificacion,
         r.total_likes,
         r.total_dislikes,
         r.fecha_creacion,
         r.fecha_actualizacion
       FROM resenas r
       INNER JOIN usuarios u ON r.usuario_id = u.id
       INNER JOIN peliculas p ON r.pelicula_id = p.id
       WHERE r.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByPeliculaAndUsuario(pelicula_id, usuario_id) {
    const [rows] = await pool.execute(
      `SELECT id, pelicula_id, usuario_id
       FROM resenas
       WHERE pelicula_id = ? AND usuario_id = ?
       LIMIT 1`,
      [pelicula_id, usuario_id]
    );
    return rows[0] || null;
  },

  async findAllByPelicula(pelicula_id) {
    const [rows] = await pool.execute(
      `SELECT 
         r.id,
         r.pelicula_id,
         r.usuario_id,
         u.nombre AS autor_nombre,
         r.titulo,
         r.comentario,
         r.calificacion,
         r.total_likes,
         r.total_dislikes,
         r.fecha_creacion,
         r.fecha_actualizacion
       FROM resenas r
       INNER JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.pelicula_id = ?
       ORDER BY r.fecha_creacion DESC`,
      [pelicula_id]
    );
    return rows;
  },

  async createWithTransaction({ pelicula_id, usuario_id, titulo, comentario, calificacion }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO resenas (pelicula_id, usuario_id, titulo, comentario, calificacion)
         VALUES (?, ?, ?, ?, ?)`,
        [pelicula_id, usuario_id, titulo, comentario, calificacion]
      );

      await this.recalculatePeliculaStats(connection, pelicula_id);

      const nuevaResena = await this.findById(result.insertId, connection);

      await connection.commit();
      return nuevaResena;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async updateWithTransaction(id, { titulo, comentario, calificacion }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const resenaActual = await this.findById(id, connection);

      await connection.execute(
        `UPDATE resenas
         SET titulo = ?, comentario = ?, calificacion = ?
         WHERE id = ?`,
        [titulo, comentario, calificacion, id]
      );

      await this.recalculatePeliculaStats(connection, resenaActual.pelicula_id);

      const resenaActualizada = await this.findById(id, connection);

      await connection.commit();
      return resenaActualizada;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async removeWithTransaction(id, pelicula_id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        `DELETE FROM resenas
         WHERE id = ?`,
        [id]
      );

      await this.recalculatePeliculaStats(connection, pelicula_id);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

export default ResenaModel;
