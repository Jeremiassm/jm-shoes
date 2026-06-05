# JM Shoes

Tienda online de zapatillas de basketball exclusivas, traídas de Estados Unidos. Catálogo, contacto y panel de administración.

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
