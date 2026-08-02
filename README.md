# Project Break 2 — Backend API (E-commerce)

> **Módulo 2 — The Bridge · Full Stack Developer + IA**

API REST de e-commerce construida con Node.js + Express, preparada para ser consumida por un frontend React.

---

## Objetivo del proyecto

El objetivo es dejar el backend **completamente preparado para que un frontend React pueda consumir la API sin problemas**. Esto significa que todo debe estar:

- limpio y sin código duplicado
- organizado en capas (server → app → routes → controllers → services → db)
- probado manualmente y con tests automáticos
- documentado con Swagger
- consistente en el formato de respuestas
- desplegado en producción con deploy automático

### Orden de prioridades

| Prioridad | Objetivo |
|---|---|
| **1 — Obligatorio** | Backend React Ready: auth, productos, reviews, wishlist, carrito, checkout, CORS, Swagger, deploy |
| **2 — Opcional** | Cloudinary: subida de imágenes de productos |
| **3 — Opcional** | Supertest: tests automáticos de endpoints |

---

## Stack

| Tecnología | Uso |
|---|---|
| Node.js 20+ | Runtime |
| Express 5.x | Framework HTTP |
| Prisma 7.x | ORM para PostgreSQL (Supabase) |
| Mongoose | ODM para MongoDB (Atlas) |
| JWT + bcrypt | Autenticación |
| swagger-jsdoc + swagger-ui-express | Documentación |
| CORS + Helmet | Seguridad |

## Estructura

```
src/
├── config/
│   ├── prisma.js          # Cliente Prisma con driver adapter (pg)
│   └── mongo.js           # Conexión Mongoose a Atlas
│
├── controllers/
│   ├── auth.controller.js
│   ├── products.controller.js
│   ├── cart.controller.js
│   ├── review.controller.js
│   └── wishlist.controller.js
│
├── services/
│   ├── auth.service.js
│   ├── products.service.js
│   ├── cart.service.js
│   ├── reviews.service.js
│   └── wishlist.service.js
│
├── routes/
│   ├── index.routes.js
│   ├── auth.routes.js
│   ├── products.routes.js
│   ├── cart.routes.js
│   ├── reviews.routes.js
│   └── wishlist.routes.js
│
├── middlewares/
│   ├── authenticate.js    # Verifica JWT en header Authorization
│   ├── requireRole.js     # Restringe rutas por rol (admin/user)
│   ├── errorHandler.js    # Manejador global de errores (500)
│   └── notFound.js        # 404 para rutas no definidas
│
├── models/
│   ├── review.model.js    # Schema Mongoose
│   └── wishlist.model.js  # Schema Mongoose
│
├── helpers/
│   └── controllers.response.js  # Helpers de respuesta HTTP consistentes
│
├── docs/
│   └── swagger.js         # Configuración swagger-jsdoc
│
├── app.js                 # Express: middlewares + rutas
└── server.js              # Arranque del servidor + conexión a BD
```

## Endpoints

### Auth
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registro de usuario |
| POST | `/api/auth/login` | Público | Login, devuelve JWT + cookie httpOnly |
| POST | `/api/auth/logout` | Autenticado | Cierra sesión (borra cookie) |
| GET | `/api/me` | Autenticado | Perfil del usuario actual |

### Productos (SQL — Supabase)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/products` | Público | Listar productos |
| GET | `/api/products/:id` | Público | Detalle de producto |
| POST | `/api/products` | Admin | Crear producto (acepta `form-data` con imagen opcional) |
| POST | `/api/products/:id/image` | Admin | Subir o reemplazar imagen (borra la anterior de Cloudinary) |
| PUT | `/api/products/:id` | Admin | Actualizar producto |
| DELETE | `/api/products/:id` | Admin | Eliminar producto |

### Reviews (MongoDB — Atlas)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/products/:id/reviews` | Público | Reviews de un producto |
| POST | `/api/products/:id/reviews` | Autenticado | Crear review |
| PUT | `/api/products/:id/reviews/:reviewId` | Autenticado | Editar review propia |
| DELETE | `/api/products/:id/reviews/:reviewId` | Autenticado | Eliminar review propia (o cualquiera si admin) |

### Wishlist (MongoDB — Atlas)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/wishlist` | Autenticado | Ver lista de favoritos |
| POST | `/api/wishlist/:productId` | Autenticado | Añadir/quitar de favoritos |

### Carrito (SQL — Supabase)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/cart` | Autenticado | Ver carrito activo (lo crea si no existe) |
| POST | `/api/cart/items` | Autenticado | Añadir producto (acumula si ya existe) |
| PATCH | `/api/cart/items/:productId` | Autenticado | Actualizar cantidad (0 elimina el producto) |
| DELETE | `/api/cart/items/:productId` | Autenticado | Eliminar producto del carrito |
| POST | `/api/cart/checkout` | Autenticado | Finalizar compra, crea pedido con precio real |

### Admin
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/admin/logs` | Admin | Historial de acciones de administrador |

### Documentación
| Ruta | Descripción |
|---|---|
| `GET /api/docs` | Swagger UI interactivo |

## Requisitos funcionales por módulo

### Servidor

Separación obligatoria entre:
- `server.js` — arranca el servidor HTTP y conecta a las BDs
- `app.js` — configura Express: middlewares, CORS, rutas

### Base de datos

Conexión correcta con ambas BDs:

```
PostgreSQL (Supabase) → usuarios, productos, carrito, pedidos
MongoDB (Atlas)       → reviews, wishlist
```

### Autenticación

Sistema completo con:
- registro de usuario
- login con JWT
- middleware `authenticate` que verifica el token en cada petición protegida
- roles de usuario (`user` / `admin`)

### Carrito — flujo de checkout

El carrito es un objeto persistente con estado (`ACTIVE` → `CHECKED_OUT`). El usuario nunca lo crea explícitamente: se genera automáticamente al hacer la primera petición al carrito.

```
CartStatus: ACTIVE → CHECKED_OUT

1. GET  /api/cart               → obtiene el carrito ACTIVE (lo crea si no existe)
2. POST /api/cart/items         → añade un producto; si ya existe, acumula la cantidad
3. PATCH /api/cart/items/:productId → actualiza cantidad
                                   si quantity = 0, elimina el producto del carrito
4. DELETE /api/cart/items/:productId → elimina el producto directamente
5. POST /api/cart/checkout      → calcula el total con precios reales en ese momento,
                                   crea un registro Order, y cierra el carrito (CHECKED_OUT)
6. El siguiente GET /api/cart   → genera un nuevo carrito ACTIVE vacío
```

**Modelos implicados (Prisma/Supabase):**
- `Cart` — un carrito por usuario en estado ACTIVE simultáneamente
- `CartItem` — línea de carrito (cartId + productId + quantity)
- `Order` — pedido finalizado con el total calculado

**Reglas de negocio:**
- Un usuario solo puede tener un carrito `ACTIVE` a la vez
- El total del pedido se calcula con `product.price` en el momento del checkout (no el precio al añadir)
- No se puede hacer checkout con el carrito vacío

### CORS

El backend debe aceptar peticiones de otros orígenes (cualquier frontend que lo consuma):

```js
app.use(cors({ origin: process.env.CORS_ORIGIN }))
```

### Swagger

Documentación interactiva disponible en `/api/docs`. Permite probar todos los endpoints sin Postman.

### Variables de entorno

Ningún valor sensible debe estar hardcodeado en el código:

```env
DATABASE_URL  # Supabase Session Pooler
MONGO_URI     # MongoDB Atlas
JWT_SECRET
PORT
CORS_ORIGIN   # Origen permitido (se configurará al integrar el frontend)
```

### Deploy

El proyecto debe estar desplegado en Render con redeploy automático en cada `git push` a `main`.

- **Producción**: https://project-break2-backend-g7za.onrender.com
- **Swagger producción**: https://project-break2-backend-g7za.onrender.com/api/docs

---

## Formato de respuestas

Todas las respuestas siguen el mismo formato para que React pueda consumirlas de forma predecible:

```json
// Éxito
{ "ok": true, "data": {} }

// Error
{ "ok": false, "error": { "message": "Descripción del error" } }
```

Implementado mediante helpers en `src/helpers/controllers.response.js`. Nunca usar `res.json()` directamente.

---

## Cloudinary — gestión de imágenes

Subida, reemplazo y borrado de imágenes de productos. El flujo es:

```
Frontend → envía imagen → Backend → Cloudinary → devuelve URL → guardamos imageUrl en BD
```

Solo se guarda la URL en la base de datos; el frontend la usa directamente como fuente de imagen.

**Comportamiento automático:**
- `POST /api/products` — acepta `form-data` con campo `image` opcional; si se envía, sube la imagen a Cloudinary
- `POST /api/products/:id/image` — reemplaza la imagen del producto; borra la anterior de Cloudinary antes de subir la nueva
- `DELETE /api/products/:id` — si el producto tiene imagen, la elimina de Cloudinary antes de borrar el producto

**Transformaciones aplicadas en cada subida:**
- Redimensionado a 800×800 con recorte inteligente centrado en el sujeto
- Formato automático según el navegador (WebP, AVIF...)
- Calidad optimizada automáticamente

## Mejora opcional 2 — Supertest

Tests de integración automáticos sobre los endpoints reales, con base de datos real. Cubren el flujo completo: autenticación, lógica de negocio y respuesta HTTP.

```bash
npm test
```

### Suites

| Fichero | Cobertura |
|---|---|
| `tests/integration/health.test.js` | GET /health |
| `tests/integration/auth.test.js` | Register, login, /api/me |
| `tests/integration/products.test.js` | CRUD productos + subida de imagen a Cloudinary |
| `tests/integration/reviews.test.js` | CRUD reviews (MongoDB) |
| `tests/integration/wishlist.test.js` | Toggle favoritos (MongoDB) |
| `tests/integration/cart.test.js` | Carrito completo + checkout |

### Convenciones

- Cada suite crea sus propios datos en `beforeAll` y los limpia en `afterAll`
- `beforeAll` empieza siempre con `cleanupTestUsers()` para garantizar estado limpio aunque una ejecución anterior se haya interrumpido
- Los rate limiters se desactivan en test con `skip: () => process.env.NODE_ENV === 'test'`
- Los helpers compartidos están en `tests/integration/helpers.js`

---

## Variables de entorno

```env
PORT=3000
DATABASE_URL=postgresql://...      # Supabase Session Pooler (IPv4, puerto 6543)
MONGO_URI=mongodb+srv://...        # MongoDB Atlas
JWT_SECRET=tu_secreto_seguro
CORS_ORIGIN=*                      # Se ajustará al integrar el frontend
```

## Comandos

```bash
# Instalar dependencias
npm install

# Arrancar en modo desarrollo (watch + .env)
npm run dev

# Arrancar en modo producción (sin --env-file, para Render)
npm start

# Regenerar cliente Prisma tras cambios en schema
npx prisma generate

# Sincronizar schema con Supabase
npx prisma db push

# Explorar BD en visual
npx prisma studio
```

## Plan de desarrollo por fases

El proyecto se construye en commits funcionales, de capa en capa:

| Fase | Contenido | Commit |
|---|---|---|
| 0 | Scaffold: package.json, server.js, app.js, .env | `chore: init project scaffold` |
| 1 | Configuración BD: prisma.js, mongo.js, schema.prisma | `feat: database config (Prisma + Mongo)` |
| 2 | Auth: register, login, JWT, middleware, roles | `feat: auth (register, login, JWT, roles)` |
| 3 | Products CRUD completo | `feat: products CRUD` |
| 4 | Helpers + middlewares transversales | `feat: response helpers and middlewares` |
| 5 | Reviews + Wishlist (MongoDB) | `feat: reviews and wishlist (MongoDB)` |
| 6 | Cart + Checkout (SQL) | `feat: cart and checkout` |
| **7** | **Seguridad: revisar y optimizar CORS, Helmet, rate limiting** | `feat: security hardening` |
| 8 | Swagger docs en /api/docs | `feat: swagger documentation` |
| 9 | Deploy en Render | `chore: deploy to Render` |
| — | CORS origen específico (se configura al integrar frontend en Módulo 3) | — |
| 10 | Cloudinary: imagen en create producto + endpoint independiente | `feat: cloudinary image upload` |
| — | Supertest (tests de endpoints) | `test: supertest endpoint tests` |

## Bases de datos

- **PostgreSQL (Supabase)**: usuarios, productos, carrito, pedidos
- **MongoDB (Atlas)**: reviews, wishlist

Usar el **Session Pooler** de Supabase (puerto 6543) si la red es IPv4-only.

## Deploy

El proyecto se despliega en [Render](https://render.com). Cada `git push` a `main` lanza un redeploy automático.

- **API**: https://project-break2-backend-g7za.onrender.com
- **Docs**: https://project-break2-backend-g7za.onrender.com/api/docs

---

## Uso de IA

La IA se usa como **copiloto**, no como sustituto. Se puede usar para revisar lógica, mejorar código, detectar errores y optimizar estructura — pero siempre entendiendo qué hace cada parte del código.

---

## Project Break 3 — registro de avance

Este backend se reutiliza como API para el proyecto final del Módulo 3 ([`modulo3/project-break-3`](../../modulo3/project-break-3/README.md), frontend). No se duplica el repo: se sigue evolucionando aquí mismo. Entradas por commit relevante relacionado con esa fase (principalmente Stripe):

| Fecha | Qué se hizo / decisiones |
|---|---|
| 2026-07-31 | Se confirma que admin/roles/CRUD productos/Cloudinary/auth híbrida (cookie + Bearer) ya estaban implementados de Project Break 2 y cubren la Semana 1 del proyecto final. Pendiente: integración de Stripe. |
| 2026-07-31 | **Decisión: una única base de datos para todos los entornos** (local, producción, y todas las features de modulo3 que ya apuntan a este backend). No se crean proyectos de Supabase/Mongo separados para test. ⚠️ Consecuencia: al ser compartida, los datos pueden cambiar por accesos simultáneos desde otro entorno/feature — si ves productos, usuarios o pedidos que no esperabas, puede ser por eso, no necesariamente un bug. Para tener un punto de partida fijo cuando haga falta, se añade el script de reset de abajo. |
| 2026-07-31 | **Decisión: el catálogo se reorienta de productos tecnológicos a viajes** (destino, no fabricante). No implica ningún cambio de schema — `Product` (`name`/`description`/`price`/`stock`/`imageUrl`) ya encaja: `name`=destino, `price`=precio por persona, `stock`=plazas disponibles. `prisma/seed.js` actualizado con 15 viajes de ejemplo. |
| 2026-08-02 | Las 15 fotos de los viajes (proporcionadas por el usuario) se guardan en `prisma/seed-images/` (dentro de este repo, no en el frontend, para que el script no dependa de otro repo) y `prisma/seed.js` ahora las sube a Cloudinary en cada reset — mismo pipeline y transformación que usará el panel admin real — en vez de usar placeholders de picsum.photos. El script también borra primero cualquier imagen existente bajo `products/` en Cloudinary (incluido un resto huérfano de pruebas anteriores que no usaba ningún producto). |
| 2026-08-02 | Nuevo endpoint `DELETE /api/products/:id/image` (quitar imagen sin borrar el producto). `errorHandler` ahora traduce errores de Multer (tamaño de archivo, tipo no permitido) a un 400 con mensaje claro, en vez de un 500 genérico que ocultaba el motivo real. |

### Script de reset y datos de prueba

`prisma/seed.js` **borra todo** (productos, usuarios, carritos, pedidos, reviews, wishlist, admin logs, e imágenes en Cloudinary bajo `products/`) y recarga un estado fijo: 15 viajes de ejemplo (con foto real subida a Cloudinary desde `prisma/seed-images/`) + un usuario normal + un usuario admin. Como actúa sobre la única base de datos compartida (también la de producción) y sobre el mismo Cloudinary, requiere el flag `--yes` explícito para no borrar nada por accidente:

```bash
npm run db:reset -- --yes
```

Tarda unos segundos más que antes: sube las 15 imágenes a Cloudinary de una en una.

Usuarios que quedan tras el reset:

| Rol | Email | Password |
|---|---|---|
| USER | `test-user@test.internal` | `Test1234!` |
| ADMIN | `test-admin@test.internal` | `Test1234!` |

Las imágenes de los viajes son fotos reales de cada destino, guardadas en `prisma/seed-images/` y subidas a Cloudinary por el propio script (carpeta `products/`, misma transformación 800×800 que usa la subida real desde el panel admin).
