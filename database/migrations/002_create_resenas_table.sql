-- Migracion HU-10 y HU-11: Tabla resenas
USE karenflix_db;

CREATE TABLE IF NOT EXISTS resenas(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  pelicula_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  comentario TEXT NOT NULL,
  calificacion TINYINT UNSIGNED NOT NULL,
  total_likes INT UNSIGNED NOT NULL DEFAULT 0,
  total_dislikes INT UNSIGNED NOT NULL DEFAULT 0,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  CONSTRAINT ck_resenas_calificacion CHECK(calificacion BETWEEN 1 AND 10),
  CONSTRAINT uq_resenas_pelicula_usuario UNIQUE(pelicula_id,usuario_id),
  CONSTRAINT fk_resenas_pelicula FOREIGN KEY(pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_resenas_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_resenas_pelicula_fecha(pelicula_id,fecha_creacion)
)ENGINE=InnoDB;
