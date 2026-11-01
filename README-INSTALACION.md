# KarenFlix Backend

API REST para registrar, calificar y rankear películas, series y animes geek. Gestiona usuarios, categorías, reseñas y rankings, con autenticación JWT y permisos diferenciados para usuario y administrador.

Referencia de endpoints: [`README-API-ENDPOINTS.md`](./README-API-ENDPOINTS.md). Documentación interactiva en `/api/v1/docs` (Swagger) con el servidor en ejecución.

## Descripción y temática

Temática: cultura geek. Los usuarios autenticados proponen títulos (`pelicula`, `serie` o `anime`) dentro de una categoría. Cada título queda `pendiente` hasta que un administrador lo aprueba o rechaza; solo los aprobados son públicos y pueden recibir reseñas (calificación de 1 a 10, una por usuario y título). Las reseñas admiten likes y dislikes, y con ellas se calcula el ranking de cada título.

## Tecnologías

- Node.js (ES Modules) y Express
- MySQL (mysql2, consultas preparadas y transacciones)
- Passport con JWT (`passport-jwt`, `jsonwebtoken`) y bcrypt
- express-validator, express-rate-limit y cors
- Swagger UI (OpenAPI 3), semver y dotenv
- nodemon (desarrollo)

## Estructura del proyecto

```
karenFlix-backend/
├── app.js                          Punto de entrada
├── .env.example                    Plantilla de variables de entorno
├── config/
│   ├── db.js                       Pool de conexiones MySQL
│   ├── passport.js                 Estrategia JWT
│   └── swagger.js                  Especificación OpenAPI
├── database/
│   └── script.sql                  Esquema de la base de datos
├── routes/                         Definición de rutas
├── controllers/                    Manejo de petición y respuesta
├── services/                       Reglas de negocio
├── models/                         Acceso a datos y transacciones
├── middlewares/
│   ├── auth.middleware.js          Autenticación JWT y roles
│   ├── validation.middleware.js    Validaciones de entrada
│   ├── rateLimiter.middleware.js   Límite de peticiones por IP
│   └── error.middleware.js         Manejo centralizado de errores
└── utils/
    └── AppError.js                 Error con código HTTP
```

## Requerimientos de instalación

- Node.js 18 o superior y npm
- MySQL 8.0.16 o superior (necesario para las restricciones `CHECK` del esquema)
- Git

## Pasos para instalar y ejecutar

1. Clonar el repositorio e instalar dependencias:

   ```bash
   git clone https://github.com/lestergarcia711/karenFlix-backend.git
   cd karenFlix-backend
   npm install
   ```

2. Crear la base de datos con el script incluido:

   ```bash
   mysql -u root -p < database/script.sql
   ```

3. Crear el archivo de entorno y completar sus valores:

   ```bash
   cp .env.example .env
   ```

4. Ejecutar el servidor:

   ```bash
   npm run dev     # desarrollo (nodemon)
   npm start       # normal
   ```

5. Verificar que responde:

   ```bash
   curl http://localhost:3000/api/v1/health
   ```

### Crear el primer administrador

El registro siempre crea usuarios con rol `usuario`. Registra la cuenta y luego promuévela en MySQL:

```sql
UPDATE karenflix_db.usuarios SET rol = 'administrador' WHERE correo = 'admin@karenflix.com';
```

Vuelve a iniciar sesión para obtener un token con el nuevo rol.

## Variables de entorno

Se definen en `.env` (ignorado por Git). Plantilla en `.env.example`.

| Variable | Ejemplo | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto del servidor |
| `NODE_ENV` | `development` | Entorno de ejecución |
| `API_VERSION` | `1.0.0` | Versión semver; define el prefijo `/api/v1` |
| `DB_HOST` | `localhost` | Host de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_USER` | `root` | Usuario de MySQL |
| `DB_PASSWORD` | `tu_password_aqui` | Contraseña de MySQL |
| `DB_NAME` | `karenflix_db` | Nombre de la base de datos |
| `DB_CONNECTION_LIMIT` | `10` | Conexiones máximas del pool |
| `JWT_SECRET` | `tu_clave_secreta_super_segura` | Clave para firmar los tokens |
| `JWT_EXPIRES_IN` | `24h` | Vigencia del token |
| `CORS_ORIGIN` | `*` | Origen permitido (en producción, la URL del frontend) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Ventana del límite de peticiones (15 min) |
| `RATE_LIMIT_MAX` | `100` | Máximo de peticiones por IP en la ventana |

Define siempre un `JWT_SECRET` propio: si falta, el código usa un valor por defecto no seguro.

## Repositorio del frontend

Frontend (HTML y CSS puro): `<REEMPLAZAR_CON_LA_URL_DEL_REPOSITORIO_FRONTEND>`

Link del repo: `https://github.com/2026Sergio/karenflix/tree/main`


URL base de la API para el frontend: `http://localhost:3000/api/v1`


link-Demo(video):`https://drive.google.com/drive/folders/1cvhjycmjowytszl2vmi8jxiystfCNirL?usp=sharing`