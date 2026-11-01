import pool from '../config/db.js';
import { ResenaModel } from './resena.model.js';

export class ReaccionModel {
  #pool;
  #resenaModel;

  constructor(dbPool = pool, resenaModelInstance = new ResenaModel(dbPool)) {
    this.#pool = dbPool;
    this.#resenaModel = resenaModelInstance;
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

  async #recalculateResenaCounters(connection, resena_id) {
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
  }

  async #applyReactionMutation(connection, existing, { resena_id, usuario_id, tipo }) {
    if (!existing) {
      await connection.execute(
        `INSERT INTO reacciones_resenas (resena_id, usuario_id, tipo)
         VALUES (?, ?, ?)`,
        [resena_id, usuario_id, tipo]
      );
      const reaccionActual = await this.findByResenaAndUsuario(resena_id, usuario_id, connection);
      return { accion: 'creada', reaccionActual };
    }

    if (existing.tipo === tipo) {
      await connection.execute(
        `DELETE FROM reacciones_resenas
         WHERE id = ?`,
        [existing.id]
      );
      return { accion: 'eliminada', reaccionActual: null };
    }

    await connection.execute(
      `UPDATE reacciones_resenas
       SET tipo = ?
       WHERE id = ?`,
      [tipo, existing.id]
    );
    const reaccionActual = await this.findByResenaAndUsuario(resena_id, usuario_id, connection);
    return { accion: 'actualizada', reaccionActual };
  }

  async findByResenaAndUsuario(resena_id, usuario_id, connection = this.#pool) {
    const [rows] = await connection.execute(
      `SELECT id, resena_id, usuario_id, tipo, fecha_creacion
       FROM reacciones_resenas
       WHERE resena_id = ? AND usuario_id = ?
       LIMIT 1`,
      [resena_id, usuario_id]
    );
    return this.#getFirstRowOrNull(rows);
  }

  async upsertOrToggleWithTransaction({ resena_id, pelicula_id, usuario_id, tipo }) {
    return this.#executeTransaction(async (connection) => {
      const existing = await this.findByResenaAndUsuario(resena_id, usuario_id, connection);
      const { accion, reaccionActual } = await this.#applyReactionMutation(
        connection,
        existing,
        { resena_id, usuario_id, tipo }
      );

      await this.#recalculateResenaCounters(connection, resena_id);
      await this.#resenaModel.recalculatePeliculaStats(connection, pelicula_id);

      const resenaActualizada = await this.#resenaModel.findById(resena_id, connection);

      return {
        accion,
        reaccion: reaccionActual,
        resena: resenaActualizada
      };
    });
  }

  async removeWithTransaction({ resena_id, pelicula_id, reaccion_id }) {
    return this.#executeTransaction(async (connection) => {
      await connection.execute(
        `DELETE FROM reacciones_resenas
         WHERE id = ?`,
        [reaccion_id]
      );

      await this.#recalculateResenaCounters(connection, resena_id);
      await this.#resenaModel.recalculatePeliculaStats(connection, pelicula_id);

      return this.#resenaModel.findById(resena_id, connection);
    });
  }
}

export const reaccionModel = new ReaccionModel();

export default ReaccionModel;
