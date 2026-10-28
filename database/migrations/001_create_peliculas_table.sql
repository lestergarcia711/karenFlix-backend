-- Migracion HU-07: Tabla peliculas
USE karenflix_db;

CREATE TABLE IF NOT EXISTS peliculas(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo ENUM('pelicula','serie','anime') NOT NULL DEFAULT 'pelicula',
  categoria_id INT UNSIGNED NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  imagen_url VARCHAR(500) NULL,
  estado ENUM('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  creado_por INT UNSIGNED NOT NULL,
  revisado_por INT UNSIGNED NULL,
  fecha_revision DATETIME NULL,
  promedio_calificacion DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  total_resenas INT UNSIGNED NOT NULL DEFAULT 0,
  puntaje_ranking DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  CONSTRAINT uq_peliculas_titulo UNIQUE(titulo),
  CONSTRAINT ck_peliculas_anio CHECK(anio BETWEEN 1888 AND 2100),
  CONSTRAINT fk_peliculas_categoria FOREIGN KEY(categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_peliculas_creador FOREIGN KEY(creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_peliculas_revisor FOREIGN KEY(revisado_por) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_peliculas_estado_ranking(estado,puntaje_ranking),
  INDEX idx_peliculas_categoria(categoria_id)
)ENGINE=InnoDB;
