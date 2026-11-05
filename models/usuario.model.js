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

  async getUserActivity(usuario_id) {
    const [peliculasPropuestas] = await this.#pool.execute(
      `SELECT id, titulo, tipo, estado, promedio_calificacion, total_resenas, fecha_creacion
       FROM peliculas
       WHERE creado_por = ?
       ORDER BY fecha_creacion DESC`,
      [usuario_id]
    );

    const [resenasEscritas] = await this.#pool.execute(
      `SELECT r.id, r.pelicula_id, p.titulo AS pelicula_titulo, r.titulo, r.comentario,
              r.calificacion, r.total_likes, r.total_dislikes, r.fecha_creacion
       FROM resenas r
       INNER JOIN peliculas p ON r.pelicula_id = p.id
       WHERE r.usuario_id = ?
       ORDER BY r.fecha_creacion DESC`,
      [usuario_id]
    );

    return {
      total_peliculas_propuestas: peliculasPropuestas.length,
      peliculas_propuestas: peliculasPropuestas,
      total_resenas_escritas: resenasEscritas.length,
      resenas_escritas: resenasEscritas
    };
  }

  async getSystemStats() {
    const [[totales]] = await this.#pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
         (SELECT COUNT(*) FROM categorias) AS total_categorias,
         (SELECT COUNT(*) FROM peliculas WHERE estado = 'aprobada') AS peliculas_aprobadas,
         (SELECT COUNT(*) FROM peliculas WHERE estado = 'pendiente') AS peliculas_pendientes,
         (SELECT COUNT(*) FROM peliculas WHERE estado = 'rechazada') AS peliculas_rechazadas,
         (SELECT COUNT(*) FROM resenas) AS total_resenas,
         (SELECT COUNT(*) FROM reacciones_resenas) AS total_reacciones`
    );
    return totales;

}
}



export const usuarioModel = new UsuarioModel();

export default UsuarioModel;
