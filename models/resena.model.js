import pool from '../config/db.js';
import { historialModel } from './historial.model.js';

export class ResenaModel {
  #pool;
  #historialModel;
  #likeWeight;
  #recencyDaysWindow;

  constructor(dbPool = pool, historialModelInstance = historialModel) {
    this.#pool = dbPool;
    this.#historialModel = historialModelInstance;
    this.#likeWeight = 0.15;
    this.#recencyDaysWindow = 30.0;
  }

  #getFirstRowOrNull(rows) {
    return rows[0] || null;
  }

  async #executeTransaction(work) {
    const connection = await this.#pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async #updatePeliculaMetrics(connection, pelicula_id) {
    const [statsRows] = await connection.execute(
      `SELECT 
         COUNT(*) AS total_resenas,
         COALESCE(ROUND(AVG(calificacion), 2), 0.00) AS promedio_calificacion,
         COALESCE(
           ROUND(
             AVG(
               calificacion
               + ((CAST(total_likes AS SIGNED) - CAST(total_dislikes AS SIGNED)) * ${this.#likeWeight})
               + (1.0 / (1.0 + GREATEST(TIMESTAMPDIFF(DAY, fecha_creacion, NOW()), 0) / ${this.#recencyDaysWindow}))
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
  }

  async recalculatePeliculaStats(connection, pelicula_id) {
    return this.#updatePeliculaMetrics(connection, pelicula_id);
  }

  async findById(id, connection = this.#pool) {
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
    return this.#getFirstRowOrNull(rows);
  }

  async findByPeliculaAndUsuario(pelicula_id, usuario_id) {
    const [rows] = await this.#pool.execute(
      `SELECT id, pelicula_id, usuario_id
       FROM resenas
       WHERE pelicula_id = ? AND usuario_id = ?
       LIMIT 1`,
      [pelicula_id, usuario_id]
    );
    return this.#getFirstRowOrNull(rows);
  }

  async findAllByPelicula(pelicula_id) {
    const [rows] = await this.#pool.execute(
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
  }

  async createWithTransaction({ pelicula_id, usuario_id, titulo, comentario, calificacion }) {
    return this.#executeTransaction(async (connection) => {
      const [result] = await connection.execute(
        `INSERT INTO resenas (pelicula_id, usuario_id, titulo, comentario, calificacion)
         VALUES (?, ?, ?, ?, ?)`,
        [pelicula_id, usuario_id, titulo, comentario, calificacion]
      );

      await this.#updatePeliculaMetrics(connection, pelicula_id);

      const nuevaResena = await this.findById(result.insertId, connection);

      await this.#historialModel.createWithConnection(connection, {
        usuario_id,
        pelicula_id,
        resena_id: nuevaResena.id,
        tipo_accion: 'registro',
        resena_titulo: nuevaResena.titulo,
        calificacion: nuevaResena.calificacion,
        descripcion: `Registro de resena "${nuevaResena.titulo}" (${nuevaResena.calificacion}/10) en "${nuevaResena.pelicula_titulo}"`
      });

      return nuevaResena;
    });
  }

  async updateWithTransaction(id, { titulo, comentario, calificacion }) {
    return this.#executeTransaction(async (connection) => {
      const resenaActual = await this.findById(id, connection);

      await connection.execute(
        `UPDATE resenas
         SET titulo = ?, comentario = ?, calificacion = ?
         WHERE id = ?`,
        [titulo, comentario, calificacion, id]
      );

      await this.#updatePeliculaMetrics(connection, resenaActual.pelicula_id);

      const resenaActualizada = await this.findById(id, connection);

      await this.#historialModel.createWithConnection(connection, {
        usuario_id: resenaActualizada.usuario_id,
        pelicula_id: resenaActualizada.pelicula_id,
        resena_id: resenaActualizada.id,
        tipo_accion: 'edicion',
        resena_titulo: resenaActualizada.titulo,
        calificacion: resenaActualizada.calificacion,
        descripcion: `Edicion de resena "${resenaActualizada.titulo}" (${resenaActualizada.calificacion}/10) en "${resenaActualizada.pelicula_titulo}"`
      });

      return resenaActualizada;
    });
  }

  async removeWithTransaction(id, pelicula_id) {
    return this.#executeTransaction(async (connection) => {
      const resenaActual = await this.findById(id, connection);

      await connection.execute(
        `DELETE FROM resenas
         WHERE id = ?`,
        [id]
      );

      await this.#updatePeliculaMetrics(connection, pelicula_id);

      if (resenaActual) {
        await this.#historialModel.createWithConnection(connection, {
          usuario_id: resenaActual.usuario_id,
          pelicula_id: resenaActual.pelicula_id,
          resena_id: null,
          tipo_accion: 'eliminacion',
          resena_titulo: resenaActual.titulo,
          calificacion: resenaActual.calificacion,
          descripcion: `Eliminacion de resena "${resenaActual.titulo}" (${resenaActual.calificacion}/10) en "${resenaActual.pelicula_titulo}"`
        });
      }
    });
  }
}

export const resenaModel = new ResenaModel();

export default ResenaModel;
