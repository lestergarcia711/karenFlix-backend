-- Schema KarenFlix

CREATE DATABASE IF NOT EXISTS karenflix_db;

USE karenflix_db;

CREATE TABLE IF NOT EXISTS usuarios(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(60) NOT NULL,
  correo VARCHAR(120) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol ENUM('usuario','administrador') NOT NULL DEFAULT 'usuario',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  CONSTRAINT uq_usuarios_correo UNIQUE(correo)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  CONSTRAINT uq_categorias_nombre UNIQUE(nombre)
)ENGINE=InnoDB;

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

CREATE TABLE IF NOT EXISTS historial(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  pelicula_id INT UNSIGNED NULL,
  resena_id INT UNSIGNED NULL,
  tipo_accion ENUM('registro','edicion','eliminacion') NOT NULL,
  resena_titulo VARCHAR(100) NULL,
  calificacion TINYINT UNSIGNED NULL,
  descripcion VARCHAR(255) NOT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id),
  CONSTRAINT fk_historial_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_historial_pelicula FOREIGN KEY(pelicula_id) REFERENCES peliculas(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_historial_resena FOREIGN KEY(resena_id) REFERENCES resenas(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_historial_usuario_fecha(usuario_id, fecha_creacion),
  INDEX idx_historial_tipo_accion(tipo_accion)
)ENGINE=InnoDB;
