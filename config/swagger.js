export class SwaggerConfig {
  #apiVersion;
  #apiMajor;
  #openApiVersion;
  #title;
  #description;

  constructor(apiVersion = '1.0.0', apiMajor = 1) {
    this.#apiVersion = apiVersion;
    this.#apiMajor = apiMajor;
    this.#openApiVersion = '3.0.3';
    this.#title = 'KarenFlix Backend API';
    this.#description =
      'API RESTful para KarenFlix: plataforma de resenas, calificaciones y ranking ponderado de peliculas, series y animes geek.';
  }

  #buildInfo() {
    return {
      title: this.#title,
      version: this.#apiVersion,
      description: this.#description
    };
  }

  #buildServers() {
    return [
      {
        url: `/api/v${this.#apiMajor}`,
        description: `Servidor API v${this.#apiMajor} (${this.#apiVersion})`
      }
    ];
  }

  #buildTags() {
    return [
      { name: 'Health', description: 'Estado y version del servicio' },
      { name: 'Auth', description: 'Registro, inicio de sesion y perfil de usuario' },
      { name: 'Categorias', description: 'Gestion de categorias' },
      { name: 'Peliculas', description: 'Propuesta, moderacion, catalogo, filtros y ranking' },
      { name: 'Resenas', description: 'Resenas y reacciones like/dislike con transacciones MySQL' }
    ];
  }

  #buildComponents() {
    return {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido en /auth/login o /auth/register'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            status: { type: 'string', example: 'fail' },
            message: { type: 'string', example: 'Error de validacion en los datos enviados.' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  campo: { type: 'string', example: 'titulo' },
                  mensaje: { type: 'string', example: 'El campo es obligatorio.' }
                }
              }
            }
          }
        }
      }
    };
  }

  #buildPaths() {
    return {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Verificar estado y version semver de la API',
          responses: {
            200: {
              description: 'Servicio activo',
              content: {
                'application/json': {
                  example: {
                    ok: true,
                    service: this.#title,
                    version: this.#apiVersion,
                    status: 'online',
                    timestamp: '2026-10-28T16:00:00.000Z'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar una nueva cuenta de usuario ',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre', 'correo', 'contrasena'],
                  properties: {
                    nombre: { type: 'string', example: 'Karen Geek' },
                    correo: { type: 'string', example: 'karen@karenflix.com' },
                    contrasena: { type: 'string', example: 'secreto123' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Usuario registrado exitosamente con su token JWT' },
            400: { description: 'Error de validacion en los datos enviados' },
            409: { description: 'El correo electronico ya se encuentra registrado' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Iniciar sesion y obtener token JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['correo', 'contrasena'],
                  properties: {
                    correo: { type: 'string', example: 'karen@karenflix.com' },
                    contrasena: { type: 'string', example: 'secreto123' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Inicio de sesion exitoso' },
            400: { description: 'Datos invalidos' },
            401: { description: 'Credenciales invalidas' }
          }
        }
      },
      '/auth/profile': {
        get: {
          tags: ['Auth'],
          summary: 'Obtener perfil del usuario autenticado',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'Datos del usuario autenticado' },
            401: { description: 'Token ausente o invalido' }
          }
        }
      },
      '/categorias': {
        get: {
          tags: ['Categorias'],
          summary: 'Listar todas las categorias ',
          responses: {
            200: { description: 'Listado de categorias' }
          }
        },
        post: {
          tags: ['Categorias'],
          summary: 'Crear una nueva categoria (Solo Administrador)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre'],
                  properties: {
                    nombre: { type: 'string', example: 'Anime' },
                    descripcion: { type: 'string', example: 'Series y peliculas de animacion japonesa' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Categoria creada exitosamente' },
            400: { description: 'Error de validacion' },
            401: { description: 'No autenticado' },
            403: { description: 'Requiere rol administrador' },
            409: { description: 'Nombre de categoria duplicado' }
          }
        }
      },
      '/categorias/{id}': {
        get: {
          tags: ['Categorias'],
          summary: 'Obtener detalle de una categoria por ID ',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Categoria encontrada' },
            404: { description: 'Categoria no encontrada' }
          }
        },
        put: {
          tags: ['Categorias'],
          summary: 'Actualizar una categoria (Solo Administrador)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nombre'],
                  properties: {
                    nombre: { type: 'string', example: 'Ciencia Ficcion' },
                    descripcion: { type: 'string', example: 'Viajes espaciales, futuro y tecnologia' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Categoria actualizada' },
            403: { description: 'Requiere rol administrador' },
            404: { description: 'Categoria no encontrada' },
            409: { description: 'Nombre duplicado' }
          }
        },
        delete: {
          tags: ['Categorias'],
          summary: 'Eliminar una categoria (Solo Administrador)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Categoria eliminada' },
            403: { description: 'Requiere rol administrador' },
            404: { description: 'Categoria no encontrada' },
            409: { description: 'No se puede eliminar porque tiene peliculas asociadas' }
          }
        }
      },
      '/peliculas': {
        get: {
          tags: ['Peliculas'],
          summary: 'Listar peliculas aprobadas con filtro por categoria y ordenamiento',
          parameters: [
            { name: 'categoria_id', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por ID de categoria' },
            { name: 'tipo', in: 'query', schema: { type: 'string', enum: ['pelicula', 'serie', 'anime'] } },
            { name: 'orden', in: 'query', schema: { type: 'string', enum: ['ranking', 'popularidad', 'recientes'] } },
            { name: 'busqueda', in: 'query', schema: { type: 'string' }, description: 'Buscar por titulo' }
          ],
          responses: {
            200: { description: 'Lista publica de peliculas aprobadas' }
          }
        },
        post: {
          tags: ['Peliculas'],
          summary: 'Proponer una nueva pelicula, serie o anime en estado pendiente',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titulo', 'descripcion', 'categoria_id', 'anio'],
                  properties: {
                    titulo: { type: 'string', example: 'Akira' },
                    descripcion: { type: 'string', example: 'Pelicula cyberpunk post-apocaliptica en Neo-Tokyo.' },
                    tipo: { type: 'string', enum: ['pelicula', 'serie', 'anime'], example: 'anime' },
                    categoria_id: { type: 'integer', example: 1 },
                    anio: { type: 'integer', example: 1988 },
                    imagen_url: { type: 'string', example: 'https://ejemplo.com/akira.jpg' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Pelicula registrada en estado pendiente' },
            400: { description: 'Error de validacion o titulo repetido' },
            401: { description: 'No autenticado' },
            404: { description: 'Categoria inexistente' }
          }
        }
      },
      '/peliculas/ranking': {
        get: {
          tags: ['Peliculas'],
          summary: 'Obtener el ranking de peliculas ordenadas de mejor a peor',
          parameters: [
            { name: 'orden', in: 'query', schema: { type: 'string', enum: ['ranking', 'popularidad'], default: 'ranking' } },
            { name: 'categoria_id', in: 'query', schema: { type: 'integer' } },
            { name: 'limite', in: 'query', schema: { type: 'integer', default: 20 } }
          ],
          responses: {
            200: { description: 'Ranking ponderado o por popularidad' }
          }
        }
      },
      '/peliculas/admin': {
        get: {
          tags: ['Peliculas'],
          summary: 'Listar todas las peliculas para moderacion del administrador',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'estado', in: 'query', schema: { type: 'string', enum: ['pendiente', 'aprobada', 'rechazada'] } }
          ],
          responses: {
            200: { description: 'Listado administrativo de peliculas' },
            403: { description: 'Requiere rol administrador' }
          }
        }
      },
      '/peliculas/{id}': {
        get: {
          tags: ['Peliculas'],
          summary: 'Obtener detalle de una pelicula aprobada junto con sus resenas',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Detalle de pelicula y sus resenas asociadas' },
            404: { description: 'Pelicula no encontrada o no aprobada' }
          }
        },
        put: {
          tags: ['Peliculas'],
          summary: 'Editar una pelicula (Solo Administrador)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titulo', 'descripcion', 'categoria_id', 'anio'],
                  properties: {
                    titulo: { type: 'string', example: 'Akira (Remasterizada)' },
                    descripcion: { type: 'string', example: 'Edicion especial 4K.' },
                    tipo: { type: 'string', enum: ['pelicula', 'serie', 'anime'], example: 'anime' },
                    categoria_id: { type: 'integer', example: 1 },
                    anio: { type: 'integer', example: 1988 },
                    imagen_url: { type: 'string', example: 'https://ejemplo.com/akira.jpg' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Pelicula actualizada exitosamente' },
            400: { description: 'Error de validacion o titulo duplicado' },
            403: { description: 'Requiere rol administrador' },
            404: { description: 'Pelicula no encontrada' }
          }
        },
        delete: {
          tags: ['Peliculas'],
          summary: 'Eliminar una pelicula (Solo Administrador)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Pelicula eliminada exitosamente' },
            403: { description: 'Requiere rol administrador' },
            404: { description: 'Pelicula no encontrada' }
          }
        }
      },
      '/peliculas/{id}/estado': {
        patch: {
          tags: ['Peliculas'],
          summary: 'Aprobar o rechazar una pelicula pendiente (Solo Administrador)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['estado'],
                  properties: {
                    estado: { type: 'string', enum: ['aprobada', 'rechazada'], example: 'aprobada' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Estado de pelicula actualizado' },
            400: { description: 'Estado invalido' },
            403: { description: 'Requiere rol administrador' },
            404: { description: 'Pelicula no encontrada' }
          }
        }
      },
      '/peliculas/{id}/resenas': {
        get: {
          tags: ['Resenas'],
          summary: 'Listar todas las resenas de una pelicula',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Lista de resenas de la pelicula' },
            404: { description: 'Pelicula no encontrada' }
          }
        },
        post: {
          tags: ['Resenas'],
          summary: 'Escribir una resena con calificacion 1-10 en transaccion MySQL ',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titulo', 'comentario', 'calificacion'],
                  properties: {
                    titulo: { type: 'string', example: 'Una joya del cyberpunk' },
                    comentario: { type: 'string', example: 'Animacion adelantada a su epoca.' },
                    calificacion: { type: 'integer', minimum: 1, maximum: 10, example: 10 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Resena guardada y calificacion de pelicula recalculada' },
            400: { description: 'Error de validacion o pelicula no aprobada' },
            401: { description: 'No autenticado' },
            409: { description: 'El usuario ya escribio una resena para esta pelicula' }
          }
        }
      },
      '/resenas/{id}': {
        put: {
          tags: ['Resenas'],
          summary: 'Editar una resena propia recalculando la nota de la pelicula',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['titulo', 'comentario', 'calificacion'],
                  properties: {
                    titulo: { type: 'string', example: 'Obra maestra absoluta' },
                    comentario: { type: 'string', example: 'Actualizando mi resena.' },
                    calificacion: { type: 'integer', minimum: 1, maximum: 10, example: 9 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Resena actualizada y nota recalculada' },
            403: { description: 'Solo el autor puede modificar su resena' },
            404: { description: 'Resena no encontrada' }
          }
        },
        delete: {
          tags: ['Resenas'],
          summary: 'Eliminar una resena propia recalculando la nota de la pelicula',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Resena eliminada y nota recalculada' },
            403: { description: 'Solo el autor puede eliminar su resena' },
            404: { description: 'Resena no encontrada' }
          }
        }
      },
      '/resenas/{id}/reacciones': {
        post: {
          tags: ['Resenas'],
          summary: 'Dar, cambiar o quitar like/dislike en resena de otro usuario',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['tipo'],
                  properties: {
                    tipo: { type: 'string', enum: ['like', 'dislike'], example: 'like' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Reaccion procesada en transaccion MySQL' },
            403: { description: 'No se permite reaccionar a resenas propias' },
            404: { description: 'Resena no encontrada' }
          }
        },
        delete: {
          tags: ['Resenas'],
          summary: 'Quitar explicitamente la reaccion de una resena',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Reaccion eliminada exitosamente' },
            404: { description: 'No existe reaccion previa o resena no encontrada' }
          }
        }
      }
    };
  }

  getSpec() {
    return {
      openapi: this.#openApiVersion,
      info: this.#buildInfo(),
      servers: this.#buildServers(),
      tags: this.#buildTags(),
      components: this.#buildComponents(),
      paths: this.#buildPaths()
    };
  }
}

export const buildSwaggerSpec = (apiVersion = '1.0.0', apiMajor = 1) =>
  new SwaggerConfig(apiVersion, apiMajor).getSpec();

export default buildSwaggerSpec;
