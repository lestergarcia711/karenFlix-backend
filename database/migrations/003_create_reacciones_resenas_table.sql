-- Migracion HU-12: Tabla reacciones_resenas
USE karenflix_db;

CREATE TABLE IF NOT EXISTS reacciones_resenas(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  resena_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  tipo ENUM('like','dislike') NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  CONSTRAINT uq_reacciones_resena_usuario UNIQUE(resena_id,usuario_id),
  CONSTRAINT fk_reacciones_resena FOREIGN KEY(resena_id) REFERENCES resenas(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reacciones_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
)ENGINE=InnoDB;
