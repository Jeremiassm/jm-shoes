# JM Shoes

Tienda online de zapatillas de basketball exclusivas, traídas de Estados Unidos. Catálogo, contacto y panel de administración.

## Cambios recientes

- **Accesibilidad**: se agregó un enlace "Saltar al contenido principal" en `cliente/index.html` con clases `sr-only` + `focus:not-sr-only`, y los estilos auxiliares correspondientes en `cliente/src/index.css` (`.sr-only`, `.focus\:not-sr-only:focus`, `.font-body`, token `--font-body`).
- **Lint a11y (opcional)**: se recomienda sumar `eslint-plugin-jsx-a11y` al cliente. No se instaló para no agregar dependencias:
  ```bash
  npm install --save-dev eslint-plugin-jsx-a11y@latest
  ```
  Una vez instalada, agregar al array `extends` dentro de `cliente/eslint.config.js`:
  ```js
  import jsxA11y from 'eslint-plugin-jsx-a11y';
  // ...
  extends: [
    jsxA11y.flatConfigs.recommended,
  ],
  ```
- **SEO**: se eliminó `cliente/public/sitemap.xml` estático porque el server expone un sitemap dinámico en `/sitemap.xml` (`server/routes/sitemap.js`).
- **DX**: se agregó `.nvmrc` (Node 20) y `.editorconfig` en la raíz del repo para alinear versiones de Node y estilo de archivos entre editores.
- **Engines**: se agregó `"engines": { "node": ">=20.0.0" }` en `cliente/package.json` (el server ya lo tenía).
- **CI**: se creó `.github/workflows/ci.yml` con un job que corre lint + build del cliente y tests del server (con servicio de PostgreSQL y `node --test`) ante cada push/PR a `main`.

## Stack

### Frontend (`cliente/`)
- **React 19** + **Vite 8**
- **Tailwind CSS 4** (con `@theme` para tokens)
- **React Router 7**
- **Framer Motion** (animaciones)
- **Recharts** (gráficos de performance)
- **Lucide React** (íconos)
- **Axios** (HTTP, con interceptor de refresh token)
- Tipografía: **Oswald** (display) + **Inter** (body)

### Backend (`server/`)
- **Node.js** + **Express 4**
- **PostgreSQL** (datos en JSONB)
- **JWT** (access + refresh) con cookies httpOnly
- **Multer** + **Sharp** (uploads con auto-optimización a WebP)
- **Helmet** + **express-rate-limit** (hardening)

## Estructura

```
jm-shoes/
├── cliente/              # Frontend React
│   ├── public/           # Assets estáticos (favicon, robots, sitemap)
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas de la app
│   │   ├── context/      # Context providers
│   │   ├── hooks/        # Custom hooks
│   │   ├── config/       # Configuración (contacto, etc.)
│   │   ├── lib/          # API client
│   │   ├── router/       # Definición de rutas
│   │   ├── styles/       # CSS
│   │   └── assets/       # Imágenes locales
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── server/               # Backend Express
    ├── middleware/       # Middlewares (auth)
    ├── db.js             # Pool de PostgreSQL + init
    ├── server.js         # API principal
    ├── data.json         # Seed inicial
    ├── .env.example
    └── package.json
```

## Setup local

### Requisitos
- Node.js 20+
- PostgreSQL 14+

### 1. Base de datos
```bash
psql -U postgres -c "CREATE DATABASE jmshoes;"
```

### 2. Backend
```bash
cd server
cp .env.example .env
# Editar .env con tus credenciales
npm install
npm run dev
# Servidor: http://localhost:3001
```

### 3. Frontend
```bash
cd cliente
npm install
npm run dev
# Cliente: http://localhost:5173
```

El frontend hace proxy de `/api` y `/uploads` al backend en `localhost:3001` (configurado en `vite.config.js`).

## Scripts

### Frontend
- `npm run dev` — Dev server con HMR
- `npm run build` — Build de producción
- `npm run preview` — Preview del build
- `npm run lint` — ESLint

### Backend
- `npm start` o `npm run dev` — Inicia el servidor (auto-migra data.json y crea admin/admin123 la primera vez)

## Credenciales iniciales

Por defecto se crea un usuario admin:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

> Cambiá la contraseña apenas puedas. Está en la tabla `users` (hash bcrypt).

## Funcionalidades

- **Home** con hero, productos destacados, badges de confianza, marcas y preview del proceso de compra.
- **Catálogo** con filtros (marca, precio, puntuación, búsqueda con debounce).
- **Detalle de producto** con galería, talles, review chart (radar), pros/contras, video opcional y pedido por WhatsApp.
- **Cómo comprar** con 5 pasos, métodos de pago, envíos, FAQ.
- **Contacto** con tarjetas de WhatsApp/email/ubicación y formulario que abre el cliente de email.
- **Panel admin** protegido con JWT para CRUD de productos, con upload múltiple de imágenes (auto-WebP) y video.

## Seguridad

- Helmet para headers HTTP.
- Rate limit en `/api/login` (10 req / 15 min).
- Validación de campos requeridos en POST/PUT.
- JWT con secretos validados al arranque (abortan si son los valores por defecto).
- Refresh tokens almacenados en DB y en cookies httpOnly.
- `.env` ignorado por git. Hay `.env.example` como template.

## Deploy

Pendiente. Stack pensado para deployar así:
- **Frontend:** Vercel, Netlify o cualquier static host.
- **Backend:** Render, Railway, Fly.io, etc.
- **PostgreSQL:** Neon, Supabase, Railway.

Para producción, hay que actualizar:
- CORS origin (en `server.js`).
- `secure: true` en la cookie de refresh.
- Secrets en variables de entorno del host.

Alternativa con Docker: ver `docker-compose.yml` en la raíz (levanta `db` + `server` + `client` con nginx como reverse proxy).

## Tests

```bash
# Backend (usa node --test nativo, sin dependencias extra)
npm --prefix .\server test
```

Cubre funciones puras en `server/lib/` (mapping, validation) y los helpers de filtros del cliente.

## Husky (git hooks)

No viene instalado por defecto para evitar dependencias extra. Para agregarlo después:

```bash
npm install --save-dev husky lint-staged
npx husky init
# editar .husky/pre-commit para correr npm test en server/ y npm run lint en cliente/
```
