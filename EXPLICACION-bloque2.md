# Qué hace cada archivo (para la sustentación)

## El camino de una petición

`POST /api/salas/abc/mensajes` pasa por: **Route Handler** (HTTP + Zod) -> **servicio** (reglas) -> **repositorio** (Firestore).
Ninguna capa se salta a otra.

## src/lib: piezas comunes

- `errores.ts`: clase `ErrorApp` (lleva el código HTTP) y conversión de errores de Zod a `{campo, mensaje}`.
- `http.ts`: `manejar()` envuelve cada ruta, convierte errores en `{ "error": ... }`, agrega `x-request-id` y registra. También `leerJson` (415 si no es JSON, 400 si es inválido), `validar` (Zod), `validarId` y `comprobarOrigen` (defensa CSRF).
- `log.ts`: una línea JSON por petición, sin datos personales ni tokens.
- `firebase-admin.ts`: inicia el Admin SDK con variables de entorno del servidor. Convierte `\n` literales de la clave.
- `auth.ts`: `requerirUsuario(request)` verifica la cookie de sesión (o un Bearer para Bruno). De aquí sale el `uid`, nunca del cuerpo.
- `sesion.ts`: cambia un idToken reciente por una cookie `HttpOnly; SameSite=Lax` de 5 días y la revoca al cerrar sesión.

## src/schemas: reglas escritas una sola vez

- `mensaje.ts`: texto de 1 a 500 caracteres, sin campos extra (`strictObject` evita _mass assignment_).
- `sala.ts`: nombre de 3 a 50 caracteres, `privada` por defecto `false`.
- `comun.ts`: `limite` (1 a 100) y `cursor`. `sesion.ts`: el cuerpo `{ idToken }`.

## src/repositories: único lugar que toca Firestore

- `salas.repo.ts`, `mensajes.repo.ts`: crear, leer, listar con cursor y eliminar. Validan con Zod lo que leen.
- `paginar.ts`: pide un documento de más para saber si hay otra página y devuelve `siguienteCursor`.
- `limites.repo.ts`: guarda en Firestore la hora del último mensaje de cada usuario, dentro de una transacción. Se usa Firestore y no memoria porque en Vercel cada petición puede caer en una instancia distinta.

## src/services: reglas de negocio

- `salas.service.ts`: crear sala (el creador es el primer miembro), listar, `obtenerSalaVisible` (404 si no existe, 403 si es privada y no eres miembro), unirse.
- `mensajes.service.ts`: listar (con `since` es el sondeo corto; sin `since` es el historial hacia atrás), enviar (debes ser miembro; si escribes más de 1 vez por segundo recibes 429) y eliminar (solo el creador de la sala).

## src/app/api: las rutas

`auth/sesion` (POST crea cookie, DELETE la borra), `auth/yo`, `salas` (GET, POST), `salas/[id]`, `salas/[id]/unirse`, `salas/[id]/mensajes` (GET, POST), `salas/[id]/mensajes/[mid]` (DELETE).

## Decisiones que usted debe poder defender

1. **Sondeo con `since` y no SSE**: más simple y cumple los 5 segundos; SSE se cierra por duración máxima en Vercel.
2. **Para escribir hay que unirse**; para leer una sala pública no.
3. **El límite es 1 mensaje por segundo**: el segundo mensaje dentro de ese segundo ya recibe 429.
4. **La cookie lleva `Secure` solo en producción**, porque en `http://localhost` algunos navegadores la rechazarían.
5. **Dos índices compuestos** (`privada + creadaEn` y `miembros + creadaEn`) para listar salas ordenadas.

## Pruebas (tests/)

- `api/mensajes.test.ts`: 401, 400, 403, 404, 429 (sexto mensaje), casos exitosos y moderación.
- `api/sesion.test.ts`: CSRF (403), sesión no reciente (401) y cookie HttpOnly.
- `integracion/enviar-mensaje.test.ts`: ruta -> servicio -> repositorio simulado.
- `services/salas.service.test.ts`: reglas de negocio de salas.
