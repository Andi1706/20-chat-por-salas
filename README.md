# Chat por salas en tiempo casi real

Proyecto 20 de Desarrollo Web (grupo martes y jueves). Un chat con salas públicas y privadas: las personas inician sesión, crean o se unen a salas y los mensajes nuevos aparecen en pocos segundos.

- **Sitio en producción:** https://20-chat-por-salas.vercel.app
- **Repositorio:** https://github.com/Andi1706/20-chat-por-salas

## Qué hace

- Registro e inicio de sesión con correo y contraseña (Firebase Auth) y cookie de sesión `HttpOnly`.
- Salas públicas y privadas; lista con búsqueda y filtro «Públicas» / «Mis salas».
- Mensajes casi en tiempo real por **sondeo** (`fetch` cada 2 s con la pestaña visible, 4 s si está oculta, y con espera creciente si falla la red).
- El mensaje propio aparece al instante («Enviando…») y se confirma cuando responde la API.
- Historial paginado hacia atrás, separadores por día y mensajes agrupados por autor.
- Límite de frecuencia: 1 mensaje por segundo por persona (responde `429`).
- La persona que creó la sala puede eliminar mensajes.
- Avisos de mensaje nuevo con la Notifications API; si no hay permiso, un contador en el título de la pestaña.
- Accesible y responsivo (360, 768 y 1024 px), con modo oscuro, contraste alto e impresión.

## Tecnologías

Next.js 16 (App Router) · React 19 · TypeScript estricto · Zod · Firebase Auth (navegador) y Firestore (solo con Admin SDK, desde el servidor) · CSS Modules · Vitest · ESLint · Prettier · Vercel.

## Arquitectura

```text
Navegador ──fetch──▶ Route Handler (HTTP + Zod) ──▶ servicio (reglas) ──▶ repositorio ──▶ Firestore
   │                      ▲
   └── Firebase Auth ──idToken──▶ POST /api/auth/sesion ──▶ cookie de sesión HttpOnly
```

- El navegador **solo** usa Firebase Auth para obtener el `idToken`. Los datos nunca se leen desde el navegador: pasan por la API propia. Las reglas de Firestore niegan todo acceso directo.
- Cada ruta verifica la sesión en el servidor. `src/proxy.ts` solo redirige a `/login` si falta la cookie para mejorar la experiencia: **no es la seguridad real**.
- El `uid` sale siempre de la sesión verificada, nunca del cuerpo ni de la URL.

```text
src/
├── app/            páginas y Route Handlers (app/api/**/route.ts)
├── components/     interfaz reutilizable y accesible
├── hooks/          useMensajes, useSalas, useAutoScroll, useAvisos…
├── cliente/        código del navegador (api, sondeo, avisos, autenticación)
├── schemas/        esquemas Zod compartidos por cliente y servidor
├── services/       reglas de negocio puras
├── repositories/   único lugar que toca Firestore
└── lib/            firebase-admin, auth, sesión, errores, http, cabeceras
tests/ · openapi.yaml · bruno/ · calidad/ · ia/
```

## Requisitos

- Node.js **22.x** (el proyecto fija `"engines": { "node": "22.x" }`)
- npm
- Un proyecto de Firebase **solo de desarrollo** con Authentication (correo y contraseña) y Firestore

## Cómo ejecutarlo en local

```bash
git clone https://github.com/Andi1706/20-chat-por-salas.git
cd 20-chat-por-salas
npm install
cp env.example .env.local     # luego escribe tus valores reales en .env.local
npm run dev
```

Abre http://localhost:3000.

### Variables de entorno

Copia `env.example` a `.env.local`. **Nunca subas `.env.local` ni el JSON de la cuenta de servicio a Git.**

| Variable                           | Dónde se usa | Origen                                             |
| ---------------------------------- | ------------ | -------------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | navegador    | Configuración web de Firebase                      |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | navegador    | Configuración web de Firebase                      |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | navegador    | Configuración web de Firebase                      |
| `NEXT_PUBLIC_FIREBASE_APP_ID`      | navegador    | Configuración web de Firebase                      |
| `FIREBASE_PROJECT_ID`              | servidor     | Cuenta de servicio                                 |
| `FIREBASE_CLIENT_EMAIL`            | servidor     | Cuenta de servicio                                 |
| `FIREBASE_PRIVATE_KEY`             | servidor     | Cuenta de servicio (en Vercel, con `\n` literales) |
| `FIRESTORE_DATABASE_ID`            | servidor     | Nombre de la base (`default`)                      |

Las cuatro `NEXT_PUBLIC_*` son públicas por diseño. Las demás son secretas y solo viven en `.env.local` (local) y en Vercel (producción).

## Scripts

| Comando                           | Qué hace                                                               |
| --------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo                                                 |
| `npm run build` / `npm start`     | Compilar y servir en modo producción                                   |
| `npm run typecheck`               | TypeScript sin emitir                                                  |
| `npm run lint`                    | ESLint sin advertencias                                                |
| `npm run format` / `format:check` | Prettier                                                               |
| `npm test`                        | Vitest con cobertura                                                   |
| `npm run check`                   | typecheck + lint + format:check + test (obligatorio antes de entregar) |

## Pruebas y calidad

- 77 pruebas de Vitest: servicios, rutas de la API, sondeo, componentes, accesibilidad con axe-core, cabeceras de seguridad y un **test de contrato** que compara `openapi.yaml` con las rutas reales.
- Reglas de ESLint: complejidad ≤ 10, funciones ≤ 50 líneas, archivos ≤ 300, sin `any`, sin `console`.
- Informe de calidad con Lighthouse, accesibilidad y retos elegidos: [`CALIDAD.md`](CALIDAD.md).

## API REST

Documentada en [`openapi.yaml`](openapi.yaml) (OpenAPI 3.1). Todas las rutas, salvo crear la sesión, exigen sesión.

| Método     | Ruta                             | Descripción                                     |
| ---------- | -------------------------------- | ----------------------------------------------- |
| POST       | `/api/auth/sesion`               | Cambia un `idToken` por la cookie de sesión     |
| DELETE     | `/api/auth/sesion`               | Cierra la sesión                                |
| GET        | `/api/auth/yo`                   | Datos de la persona autenticada                 |
| GET / POST | `/api/salas`                     | Listar (paginado) / crear sala                  |
| GET        | `/api/salas/{id}`                | Ver una sala                                    |
| POST       | `/api/salas/{id}/unirse`         | Unirse a una sala                               |
| GET / POST | `/api/salas/{id}/mensajes`       | Historial y sondeo (`?since=`) / enviar mensaje |
| DELETE     | `/api/salas/{id}/mensajes/{mid}` | Eliminar un mensaje (quien creó la sala)        |

Errores siempre con la forma `{ "error": "texto", "detalles": [...] }`.

### Colección de Bruno

La carpeta `bruno/` tiene 16 solicitudes con sus pruebas, para los entornos `local` y `produccion`.

1. Abre Bruno y la colección `bruno/`, y elige el entorno.
2. En el entorno, escribe `apiKey` (la `NEXT_PUBLIC_FIREBASE_API_KEY`) y guarda `clave` como **secreto** (la contraseña del usuario de prueba).
3. Activa el **Developer Mode** (lo necesita la solicitud 11) y ejecuta la colección: deben salir 16 en verde.

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Carga las 8 variables de entorno de la tabla.
3. Fija Node en **22.x** (el `package.json` ya lo exige).
4. En Firebase Console, en **Authentication → Settings → Authorized domains**, agrega el dominio de Vercel.

## Seguridad

- Cabeceras en todas las respuestas (`next.config.ts`, `src/lib/cabeceras.ts`): CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`.
- Cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción; comprobación de `Origin` contra CSRF.
- Las respuestas privadas llevan `Cache-Control: no-store`.
- Validación con Zod en cada entrada y límite de frecuencia por persona.

## Decisiones y límites conocidos

- **Sondeo en vez de SSE:** más simple y compatible con las funciones de Vercel; el enunciado permite ambos.
- La página `/perfil` muestra los datos; el nombre se deriva del correo y no se puede editar.
- Después de entrar o salir se usa una navegación completa (`src/cliente/navegacion.ts`) para evitar que Next.js reutilice una redirección guardada antes de iniciar sesión.

## Uso de IA

La configuración de IA del proyecto (`AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`) y la bitácora están en el repositorio. Ver [`ia/BITACORA.md`](ia/BITACORA.md).
