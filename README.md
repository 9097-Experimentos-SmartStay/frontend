# SmartStay — Frontend web

Aplicación web de SmartStay para la gestión hotelera. El personal administra hoteles, habitaciones,
reservas, pagos y usuarios, y consulta indicadores y la auditoría de accesos. Los huéspedes crean su
cuenta, buscan hoteles, reservan y ven cómo pagar (el pago se hace fuera de la app y lo registra recepción).

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
| Imágenes | Cloudinary (subida firmada: la API firma y el navegador sube directo) |
| Códigos QR | `qrcode` (el URI `otpauth://` del segundo factor se dibuja en el navegador; el secreto nunca sale a otro servicio) |

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
| `VITE_*_ENDPOINT_PATH` | No | Rutas de cada recurso (`/authentication`, `/users`, `/audit-logs`, `/guests`, `/staff`, `/hotels`, ...). Tienen valores por defecto en `src/shared/infrastructure/config/api-config.js`. |

El backend arma los enlaces de sus correos con `App__WebBaseUrl` (por ejemplo `https://<app>.vercel.app`):
esa URL debe apuntar a esta aplicación para que funcionen `/verify-email` y `/reset-password`.

**Imágenes de hoteles (subida firmada).** La web no tiene credenciales ni variables de Cloudinary: al elegir una foto
pide una firma de corta vida a la API (`POST /media/hotel-images/signature`, solo administradores) y sube el archivo
directo a Cloudinary con esa firma (sin el token de SmartStay). El nombre de la cuenta, la API key, el preset y la
carpeta llegan en la respuesta; el API secret solo vive en el backend (`Cloudinary__*`). Antes de pedir la firma se
valida el archivo: JPG, PNG o WebP, máximo 10 MB. Si la API no tiene Cloudinary configurado responde 503 y la web
muestra que la subida no está disponible.

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
3. Agrega el dominio de Vercel a los orígenes permitidos (CORS) del backend.
4. Cada cambio de variables requiere un nuevo deploy, porque se incrustan al compilar.

## Rutas

| Ruta | Acceso | Qué hace |
|---|---|---|
| `/login` | Pública (si ya hay sesión, va al panel) | Inicio de sesión con correo y contraseña, opción "Recordarme" (US-02). Muestra avisos de `?reason=` (sesión expirada, revocada, cuenta desactivada, segundo paso vencido) y de `?notice=` (contraseña actualizada, correo confirmado, sesión cerrada en todos los dispositivos). |
| `/login/two-factor/setup` | Segundo paso del personal sin app de autenticación | US-52: código QR (y clave manual) para la app de autenticación, código de 6 dígitos y los 10 códigos de recuperación, que se muestran una sola vez. |
| `/login/two-factor` | Segundo paso del personal con MFA activo | US-52: código de 6 dígitos o un código de recuperación. Sin un inicio de sesión en curso (por ejemplo, al recargar) vuelve a `/login`. |
| `/register` | Pública | Registro de huésped con nombre, apellido, correo y contraseña de al menos 15 caracteres (US-01). |
| `/verify-email?token=` | Pública, también con sesión | Enlace del correo de verificación. Estados: confirmado, vencido o inválido, con opción de reenviar. |
| `/forgot-password?email=` | Pública | Solicitud del enlace de recuperación; siempre muestra el mismo mensaje (US-04). |
| `/reset-password?token=` | Pública, también con sesión | Enlace del correo de recuperación: nueva contraseña; si el enlace venció, permite pedir otro. |
| `/dashboard` | Con sesión | Redirige según el rol: `guest` → `/guest/dashboard`; `reception`, `housekeeping`, `maintenance`, `admin`, `chain_admin` → `/staff/dashboard`. |
| `/bookings`, `/rooms` | Con sesión (enlaces de los correos) | Abren las reservas o las habitaciones del área del rol: huésped → `/guest/bookings` o `/guest/accommodations/rooms`; personal → `/staff/bookings` o `/staff/rooms/map`. |
| `/guest/bookings/new?hotelId=&checkIn=&checkOut=` | Rol `guest` | US-51: búsqueda de habitaciones libres por hotel y fechas (precio por noche y total) y reserva; ante un 409 ofrece buscar de nuevo. |
| `/guest/bookings`, `/guest/bookings/:bookingId` | Rol `guest` | "Mis reservas": código, estado, plazo de pago con cuenta regresiva, cómo pagar, pago registrado o reembolsado, cancelación según la política. |
| `/guest/...` (resto) | Rol `guest` | Hoteles y habitaciones. |
| `/staff/bookings` | Personal (calendario, altas y cambios: `reception`, `admin`, `chain_admin`) | US-07: calendario mensual/semanal, lista, reserva manual, cambio de fechas o habitación, cancelación y "Registrar pago". |
| `/staff/rooms/map` | Personal del hotel, `chain_admin` (elige hotel) | US-06: mapa de habitaciones por color, tiempo en el estado, alerta de mantenimiento, cambio de estado e historial. |
| `/staff/rooms`, `/staff/rooms/new`, `/staff/rooms/:roomId/edit` | Lectura: personal; alta y edición: `admin` (su hotel), `chain_admin` | US-53: habitaciones con número único por hotel y precio por noche mayor que 0; tipos de habitación. |
| `/staff/hotels`, `/staff/hotels/new`, `/staff/hotels/:hotelId/edit` | Lectura: personal; registro: `admin` sin hotel, `chain_admin` | US-53: un hotel por administrador; errores por campo; no se borra un hotel con reservas activas. Al registrar su hotel, el `admin` recibe una sesión nueva con el hotel (sin volver a iniciar sesión). |
| `/staff/hotels/:hotelId/payment-settings` | `admin` de ese hotel y `chain_admin` (editan); recepción del hotel (solo lectura) | Métodos de pago del hotel (titular, Yape, Plin, banco, cuenta, CCI). Sin métodos el hotel no acepta reservas; el panel y las habitaciones del `admin` muestran un aviso. |
| `/staff/payments` | `reception`, `admin`, `chain_admin` | Pagos por reserva: monto, medio, número de operación, estado (pagado o reembolsado). |
| `/staff/users`, `/staff/audit-log` | `admin`, `chain_admin` | Gestión de usuarios y roles, restablecer la verificación en dos pasos, y auditoría de accesos (US-03, US-52). |
| `/perfil` | Con sesión | Perfil propio, cambio de contraseña y "Cerrar sesión en todos los dispositivos". |

Las reglas de acceso están en `src/iam/domain/user-role.js` (roles, áreas y capacidades) y el guard en `src/router.js`.

## Sesión

- El token de acceso dura 30 minutos. Sin "Recordarme", la sesión vive en `sessionStorage` (termina al cerrar el navegador).
- Con "Recordarme", el backend entrega un refresh token: la sesión se guarda en `localStorage` y el cliente HTTP
  renueva el token en silencio (antes de que venza, o una vez ante un 401 "expired"), serializando las renovaciones
  porque el refresh token es de un solo uso. Si la renovación falla, la app cierra la sesión y vuelve al login.
- "Cerrar sesión" revoca en el backend la sesión recordada (`POST /authentication/sign-out`); "Cerrar sesión en todos
  los dispositivos" (perfil) invalida todas las sesiones de la cuenta (`POST /authentication/sign-out-all`).
- El personal completa un segundo factor (TOTP) después de la contraseña. El `mfaToken` de ese paso solo vive en memoria
  y solo se envía a `/authentication/mfa/*`; "Recordarme" se aplica cuando el segundo paso termina bien.

## Estructura

El código se organiza por **bounded context**, y cada contexto sigue las mismas capas:

```
src/
├── iam/              # Cuentas: sign-in, sign-up, verificación, recuperación, usuarios, auditoría, roles
├── accommodations/   # Hoteles, habitaciones, tipos de habitación y opciones (categorías, comodidades)
├── bookings/         # Reservas
├── payments/         # Pagos (instrucciones al huésped, registro por recepción)
├── analytics/        # Indicadores del panel del personal
├── profile/          # Perfiles de huésped (/guests) y del personal (/staff)
├── shared/           # Núcleo compartido: cliente HTTP, sesión, configuración, rutas y vistas comunes
├── locales/          # Traducciones (es.json, en.json)
├── router.js         # Rutas y guard global
└── main.js           # Arranque de la app
```

Capas dentro de cada contexto:

- `domain/`: entidades, value objects, comandos y reglas, sin dependencias de frameworks.
- `application/`: stores de Pinia. Orquestan casos de uso y exponen estado a las vistas.
- `infrastructure/`: clases `*Api` (HTTP) y assemblers (recurso de la API ↔ entidad).
- `presentation/`: vistas, componentes y rutas del contexto.

Reglas que conviene respetar:

- Las vistas hablan **solo con los stores**. Nunca importan axios ni clases `*Api`.
- Todo el HTTP hacia la API pasa por `shared/infrastructure/http/http-client.js`: agrega el token
  `Bearer`, renueva las sesiones recordadas y, ante un 401 definitivo, cierra la sesión y redirige al login.
- Los errores de la API son ProblemDetails (`shared/infrastructure/http/problem-details.js`); las vistas nunca
  muestran el `detail` en inglés: los stores traducen el error a una causa y la vista a un texto de i18n.
- La sesión se lee y escribe solo con `shared/infrastructure/session/session-storage.js`.
- La política de contraseñas vive en `iam/domain/model/password-policy.js`.
- Las reglas de roles viven en `iam/domain/user-role.js`.
- Todo texto visible va en `src/locales/es.json` y `src/locales/en.json` (español neutro, con tuteo).
