# KarenFlix Backend - Endpoints

Instalación y configuración: [`README-INSTALACION.md`](./README-INSTALACION.md).

- URL base: `http://localhost:3000/api/v1`
- Autenticación: cabecera `Authorization: Bearer <token>`
- Acceso: **Público**, **Usuario** (cualquier token) o **Admin** (rol administrador)

```bash
BASE_URL="http://localhost:3000/api/v1"
TOKEN="<token_de_usuario>"
ADMIN_TOKEN="<token_de_administrador>"
```

## Resumen

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/register` | Público | Registrar usuario |
| POST | `/auth/login` | Público | Iniciar sesión |
| GET | `/auth/profile` | Usuario | Perfil propio |
| GET | `/categorias`, `/categorias/:id` | Público | Consultar categorías |
| POST, PUT, DELETE | `/categorias`, `/categorias/:id` | Admin | Gestionar categorías |
| GET | `/peliculas` | Público | Catálogo aprobado con filtros |
| GET | `/peliculas/ranking` | Público | Ranking de títulos |
| GET | `/peliculas/:id` | Público | Detalle con reseñas |
| POST | `/peliculas` | Usuario | Proponer título (queda pendiente) |
| GET | `/peliculas/admin` | Admin | Listado completo (`?estado=`) |
| PATCH | `/peliculas/:id/estado` | Admin | Aprobar o rechazar |
| PUT, DELETE | `/peliculas/:id` | Admin | Editar o eliminar |
| GET | `/peliculas/:id/resenas` | Público | Reseñas de un título |
| POST | `/peliculas/:id/resenas` | Usuario | Crear reseña |
| PUT, DELETE | `/resenas/:id` | Usuario (autor) | Editar o eliminar reseña propia |
| POST, DELETE | `/resenas/:id/reacciones` | Usuario | Dar o quitar like o dislike |
| GET | `/usuarios/mi-actividad` | Usuario | Ver mis títulos propuestos y mis reseñas |
| GET | `/usuarios/historial` | Admin | Estadísticas e historial global del sistema |

## Ejemplos

### Registro y login

```bash
curl -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" \
  -d '{"nombre":"Karen Lopez","correo":"karen@example.com","contrasena":"secreto123"}'

curl -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" \
  -d '{"correo":"karen@example.com","contrasena":"secreto123"}'
```

Respuesta (`201` en registro, `200` en login):

```json
{
  "ok": true,
  "message": "Inicio de sesion exitoso.",
  "data": {
    "usuario": { "id": 1, "nombre": "Karen Lopez", "correo": "karen@example.com", "rol": "usuario" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Crear categoría (Admin)

```bash
curl -X POST "$BASE_URL/categorias" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Mecha","descripcion":"Robots gigantes"}'
```

### Proponer un título (Usuario)

```bash
curl -X POST "$BASE_URL/peliculas" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "titulo": "Neon Genesis Evangelion",
    "descripcion": "Un joven piloto enfrenta a los Angeles.",
    "tipo": "anime",
    "categoria_id": 1,
    "anio": 1995,
    "imagen_url": "https://example.com/eva.jpg"
  }'
```

Respuesta `201`: el título se crea con `"estado": "pendiente"`.

### Aprobar un título (Admin)

```bash
curl -X PATCH "$BASE_URL/peliculas/1/estado" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"estado":"aprobada"}'
```

### Catálogo y ranking (Público)

```bash
curl "$BASE_URL/peliculas?tipo=anime&categoria_id=1&orden=ranking"
curl "$BASE_URL/peliculas?busqueda=evangelion"
curl "$BASE_URL/peliculas/ranking?orden=popularidad&limite=10"
```

Parámetros de `GET /peliculas`: `categoria_id`, `tipo` (`pelicula`, `serie`, `anime`), `busqueda` (por título) y `orden` (`ranking`, `popularidad`, `recientes`; por defecto `recientes`). El ranking acepta además `limite` (1 a 100, por defecto 20).

```json
{
  "ok": true,
  "data": {
    "criterio": "ranking",
    "ranking": [
      { "posicion": 1, "id": 1, "titulo": "Neon Genesis Evangelion", "tipo": "anime",
        "promedio_calificacion": "9.00", "total_resenas": 3, "puntaje_ranking": "10.2150" }
    ]
  }
}
```

Los decimales pueden llegar como texto; conviértelos con `Number()` en el frontend.

### Reseñas

```bash
curl -X POST "$BASE_URL/peliculas/1/resenas" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"titulo":"Una obra maestra","comentario":"Intensa y memorable.","calificacion":10}'

curl -X PUT "$BASE_URL/resenas/1" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"titulo":"Revisada","comentario":"Sigue siendo excelente.","calificacion":9}'

curl -X DELETE "$BASE_URL/resenas/1" -H "Authorization: Bearer $TOKEN"
```

### Reacciones

```bash
curl -X POST "$BASE_URL/resenas/1/reacciones" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tipo":"like"}'
```

La respuesta indica `accion`: `creada`, `actualizada` (cambio de like a dislike o viceversa) o `eliminada` (se repitió la misma reacción).

### Actividad y estadísticas de usuarios

```bash
# Ver mi actividad: películas propuestas y reseñas escritas (Usuario)
curl -X GET "$BASE_URL/usuarios/mi-actividad" \
  -H "Authorization: Bearer $TOKEN"

# Ver estadísticas generales del sistema (Admin)
curl -X GET "$BASE_URL/usuarios/historial" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Respuesta de `/usuarios/mi-actividad` (`200`):

```json
{
  "ok": true,
  "data": {
    "actividad": {
      "total_peliculas_propuestas": 1,
      "peliculas_propuestas": [
        { "id": 1, "titulo": "Neon Genesis Evangelion", "tipo": "anime", "estado": "aprobada", "promedio_calificacion": "9.00", "total_resenas": 3, "fecha_creacion": "2026-11-05T14:20:00.000Z" }
      ],
      "total_resenas_escritas": 1,
      "resenas_escritas": [
        { "id": 1, "pelicula_id": 1, "pelicula_titulo": "Neon Genesis Evangelion", "titulo": "Una obra maestra", "comentario": "Intensa y memorable.", "calificacion": 10, "total_likes": 2, "total_dislikes": 0, "fecha_creacion": "2026-11-05T14:25:00.000Z" }
      ]
    }
  }
}
```

Respuesta de `/usuarios/historial` (`200`):

```json
{
  "ok": true,
  "data": {
    "historial": {
      "total_usuarios": 4,
      "total_categorias": 6,
      "peliculas_aprobadas": 10,
      "peliculas_pendientes": 2,
      "peliculas_rechazadas": 1,
      "total_resenas": 15,
      "total_reacciones": 28
    }
  }
}
```

## Reglas principales

- Solo se pueden reseñar títulos aprobados, y una vez por usuario y título (`409` si se repite).
- Solo el autor edita o elimina su reseña (`403` en caso contrario). No se puede reaccionar a la reseña propia.
- No se puede eliminar una categoría con títulos asociados (`409`).
- Cada cambio en reseñas o reacciones recalcula promedio, total de reseñas y puntaje del título en una transacción MySQL.
- Puntaje de ranking: promedio por reseña de `calificacion + (likes - dislikes) * 0.15 + 1 / (1 + dias / 30)`.

## Validaciones y errores

Reglas principales: `nombre` de 2 a 60 caracteres, `correo` válido y único, `contrasena` de 6 a 100, `calificacion` entera de 1 a 10, `anio` entre 1888 y 2100, `imagen_url` con URL válida, y `:id` entero positivo.

Formato de error (los detalles aparecen solo en validaciones):

```json
{
  "ok": false,
  "status": "fail",
  "message": "Error de validacion en los datos enviados.",
  "details": [{ "campo": "correo", "mensaje": "Debe proporcionar un correo electronico valido." }]
}
```

Códigos usados: `200` y `201` (éxito), `400` (validación), `401` (sin token o token inválido), `403` (sin permisos), `404` (no encontrado), `409` (duplicado o conflicto), `429` (límite de peticiones) y `500` (error interno).
