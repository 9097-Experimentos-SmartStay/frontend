# SmartStay — Frontend web

Aplicación web de SmartStay para la gestión hotelera. El personal administra hoteles, habitaciones,
reservas y pagos, y consulta indicadores. Los huéspedes buscan hoteles, reservan y pagan (pago simulado).

Consume la API REST del backend de SmartStay (`/api/v1`).

## Stack

| Área | Tecnología |
|---|---|
| Framework | Vue 3.5 (Composition API, `<script setup>`) |
| Build | Vite 7 |
| UI | PrimeVue 4 (tema Aura), PrimeIcons, PrimeFlex |
| Estado | Pinia |
| Rutas | Vue Router 4 (modo history) |
| Idiomas | vue-i18n (español por defecto, inglés) |
| HTTP | axios (un único cliente compartido) |
| Gráficos | Chart.js (vía PrimeVue Chart) |
| Imágenes | Cloudinary (subida sin firma desde el navegador) |

## Requisitos

- Node.js 20.19 o superior (lo exige Vite 7)
- npm (el repositorio usa `package-lock.json`)
- El backend de SmartStay corriendo en local (por defecto en `http://localhost:10000`) o una URL pública del backend

## Puesta en marcha

```bash
npm ci
cp .env.example .env.development   # completa los valores
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

En desarrollo, el navegador llama a `/api/v1/...` en el mismo origen y el proxy de Vite reenvía la petición
a `VITE_DEV_PROXY_TARGET`, así que no necesitas configurar CORS en el backend para trabajar en local.

## Variables de entorno

Vite las incrusta en el bundle al compilar, así que se definen **en tiempo de build**.
Los archivos `.env.*` reales no se versionan; usa `.env.example` como plantilla.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_SMARTSTAY_API_URL` | Sí | URL base de la API. En desarrollo, una ruta relativa (`/api/v1`). En producción, la URL absoluta del backend, por ejemplo `https://<backend>.onrender.com/api/v1`. |
| `VITE_DEV_PROXY_TARGET` | No (solo dev) | Destino del proxy de Vite. Por defecto `http://localhost:10000`. Si incluye una ruta (`https://host/api/v1`), esa ruta reemplaza al prefijo y nunca se duplica `/api/v1`. |
| `VITE_CLOUDINARY_CLOUD_NAME` | Para subir imágenes | Nombre de la cuenta de Cloudinary. |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Para subir imágenes | Upload preset **sin firma** de Cloudinary. |
| `VITE_*_ENDPOINT_PATH` | No | Rutas de cada recurso (`/hotels`, `/rooms`, ...). Tienen valores por defecto en `src/shared/infrastructure/config/api-config.js`. |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente y proxy a la API. |
| `npm run build` | Compila la versión de producción en `dist/`. |
| `npm run preview` | Sirve `dist/` en local para revisar el build. |

## Despliegue en Vercel

1. Importa el repositorio en Vercel. `vercel.json` ya define el framework (Vite), el comando de build,
   la carpeta de salida (`dist`) y el rewrite de SPA (toda ruta sirve `index.html`, así que recargar
   `/staff/hotels` no da 404).
2. En **Settings → Environment Variables** define, como mínimo:
   - `VITE_SMARTSTAY_API_URL=https://<backend>/api/v1`
   - `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET`
3. Agrega el dominio de Vercel a los orígenes permitidos (CORS) del backend.
4. Cada cambio de variables requiere un nuevo deploy, porque se incrustan al compilar.

## Estructura

El código se organiza por **bounded context**, y cada contexto sigue las mismas capas:

```
src/
├── iam/              # Autenticación: sign-in, sign-up, usuarios, reglas de roles
├── accommodations/   # Hoteles, habitaciones, tipos de habitación y opciones (categorías, comodidades)
├── bookings/         # Reservas
├── payments/         # Pagos (simulados)
├── analytics/        # Indicadores del panel del personal
├── profile/          # Perfiles
├── shared/           # Núcleo compartido: cliente HTTP, sesión, configuración, rutas y vistas comunes
├── locales/          # Traducciones (es.json, en.json)
├── router.js         # Rutas y guard global
└── main.js           # Arranque de la app
```

Capas dentro de cada contexto:

- `domain/`: entidades y comandos, sin dependencias de frameworks.
- `application/`: stores de Pinia. Orquestan casos de uso y exponen estado a las vistas.
- `infrastructure/`: clases `*Api` (HTTP) y assemblers (recurso de la API ↔ entidad).
- `presentation/`: vistas, componentes y rutas del contexto.

Reglas que conviene respetar:

- Las vistas hablan **solo con los stores**. Nunca importan axios ni clases `*Api`.
- Todo el HTTP hacia la API pasa por `shared/infrastructure/http/http-client.js`: agrega el token
  `Bearer` y, ante un 401, cierra la sesión y redirige al login.
- La sesión (token, rol, usuario) se lee y escribe solo con `shared/infrastructure/session/session-storage.js`.
- Las reglas de roles viven en `iam/domain/user-role.js`.
- Todo texto visible va en `src/locales/es.json` y `src/locales/en.json` (español neutro, con tuteo).
