import mysql from 'mysql2/promise';

export class Database {
  #config;
  #pool;

  constructor(customConfig = {}) {
    this.#config = this.#buildConfig(customConfig);
    this.#pool = this.#createPool();
  }

  #buildConfig(customConfig) {
    return {
      host: customConfig.host || process.env.DB_HOST || 'localhost',
      port: Number(customConfig.port || process.env.DB_PORT) || 3306,
      user: customConfig.user || process.env.DB_USER || 'root',
      password: customConfig.password ?? process.env.DB_PASSWORD ?? '',
      database: customConfig.database || process.env.DB_NAME || 'karenflix_db',
      waitForConnections: true,
      connectionLimit: Number(customConfig.connectionLimit || process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: 0
    };
  }

  #createPool() {
    return mysql.createPool(this.#config);
  }

  getPool() {
    return this.#pool;
  }

  async execute(query, params = []) {
    return this.#pool.execute(query, params);
  }

  async getConnection() {
    return this.#pool.getConnection();
  }

  async testConnection() {
    const connection = await this.#pool.getConnection();
    try {
      await connection.ping();
      console.log('Conexion a la base de datos MySQL establecida correctamente.');
    } finally {
      connection.release();
    }
  }
}

export const database = new Database();

export default database.getPool();
