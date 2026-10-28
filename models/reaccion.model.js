import pool from '../config/db.js';
import { ResenaModel } from './resena.model.js';

export const ReaccionModel = {
  async recalculateResenaCounters(connection, resena_id) {
    const [counts] = await connection.execute(
      `SELECT 
         COALESCE(SUM(CASE WHEN tipo = 'like' THEN 1 ELSE 0 END), 0) AS total_likes,
         COALESCE(SUM(CASE WHEN tipo = 'dislike' THEN 1 ELSE 0 END), 0) AS total_dislikes
       FROM reacciones_resenas
       WHERE resena_id = ?`,
      [resena_id]
    );

    const { total_likes, total_dislikes } = counts[0];

    await connection.execute(
      `UPDATE resenas
       SET total_likes = ?,
           total_dislikes = ?
       WHERE id = ?`,
      [total_likes, total_dislikes, resena_id]
    );
  },

  async findByResenaAndUsuario(resena_id, usuario_id, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT id, resena_id, usuario_id, tipo, fecha_creacion
       FROM reacciones_resenas
       WHERE resena_id = ? AND usuario_id = ?
       LIMIT 1`,
      [resena_id, usuario_id]
    );
    return rows[0] || null;
  },

  async upsertOrToggleWithTransaction({ resena_id, pelicula_id, usuario_id, tipo }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const existing = await this.findByResenaAndUsuario(resena_id, usuario_id, connection);
      let accion = 'creada';
      let reaccionActual = null;

      if (!existing) {
        await connection.execute(
          `INSERT INTO reacciones_resenas (resena_id, usuario_id, tipo)
           VALUES (?, ?, ?)`,
          [resena_id, usuario_id, tipo]
        );
        reaccionActual = await this.findByResenaAndUsuario(resena_id, usuario_id, connection);
      } else if (existing.tipo === tipo) {
        await connection.execute(
          `DELETE FROM reacciones_resenas
           WHERE id = ?`,
          [existing.id]
        );
        accion = 'eliminada';
        reaccionActual = null;
      } else {
        await connection.execute(
          `UPDATE reacciones_resenas
           SET tipo = ?
           WHERE id = ?`,
          [tipo, existing.id]
        );
        accion = 'actualizada';
        reaccionActual = await this.findByResenaAndUsuario(resena_id, usuario_id, connection);
      }

      await this.recalculateResenaCounters(connection, resena_id);
      await ResenaModel.recalculatePeliculaStats(connection, pelicula_id);

      const resenaActualizada = await ResenaModel.findById(resena_id, connection);

      await connection.commit();
      return {
        accion,
        reaccion: reaccionActual,
        resena: resenaActualizada
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async removeWithTransaction({ resena_id, pelicula_id, reaccion_id }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        `DELETE FROM reacciones_resenas
         WHERE id = ?`,
        [reaccion_id]
      );

      await this.recalculateResenaCounters(connection, resena_id);
      await ResenaModel.recalculatePeliculaStats(connection, pelicula_id);

      const resenaActualizada = await ResenaModel.findById(resena_id, connection);

      await connection.commit();
      return resenaActualizada;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

export default ReaccionModel;
