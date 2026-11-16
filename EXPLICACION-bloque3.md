# Qué hace cada archivo (para la sustentación)

## La idea general

El navegador **nunca habla con Firestore**. Habla solo con nuestra API (`/api/...`), y la API habla con Firestore.
Para entrar, Firebase Auth (en el navegador) da un `idToken`, y nuestro servidor lo cambia por una **cookie HttpOnly**:
JavaScript no puede leerla, así que no hay token que robar desde la página.

## src/cliente: lógica sin React (se prueba fácil)

- `api.ts`: `pedirApi()` es el único `fetch` de la aplicación. Convierte errores `{error}` en `ErrorApi` y no guarda tokens.
- `firebase.ts`: inicia Firebase Auth con las 4 variables públicas. Solo Auth, nada de Firestore.
- `autenticacion.ts`: `entrar()` (Firebase -> idToken -> cookie), `salir()`, el esquema Zod de credenciales y
  `destinoSeguro()` que impide **redirecciones abiertas** (`?siguiente=https://malo.com`).
- `polling.ts`: funciones puras. `calcularEspera` (2 s visible, 4 s oculta, se duplica con cada fallo hasta 30 s),
  `combinarMensajes` (sin repetidos y en orden) y `marcaDeSondeo` (último mensaje menos 1 s).
- `sondeo.ts`: clase `Sondeo`. Primera vez pide el historial; después pide `?since=<marca>` cada pocos segundos.
  Si falla la red, reintenta cada vez más despacio (**retroceso exponencial**). Si el error es 401/403/404, se detiene.
  Con la **Page Visibility API** baja la frecuencia en pestaña oculta y consulta de inmediato al volver.
- `avisos.ts`: notificaciones del sistema (**Notifications API**) y, como plan B, contador en el título de la pestaña.
- `formularios.ts`: pasa los errores de Zod a `{campo: mensaje}`.

## src/hooks: conectan lo anterior con React

- `useMensajes`: estado de la sala (cargando/listo/error/sinSesion), enviar, eliminar y ver mensajes anteriores (cursor).
- `useAvisos`: cuenta los mensajes ajenos que llegan con la pestaña oculta. `usePermisoAvisos` usa `useSyncExternalStore`.
- `useAutoScroll`: `useRef` + `useLayoutEffect` dejan la lista pegada al final sin saltos, salvo que usted haya subido a leer.
- `useCargar` y `useSalas`: piden datos y entregan los 3 estados (cargando, error, listo) y paginación.

## src/components: las piezas de la pantalla

- `ProveedorUsuario`: pregunta una vez `/api/auth/yo` y comparte quién es el usuario (contexto).
- `Encabezado`: marca, navegación (`<nav>`), nombre y botón Salir.
- `FormularioLogin`, `FormularioSala`, `FormularioMensaje`: validan con **los mismos esquemas Zod del servidor** antes de enviar.
- `Campo`: etiqueta + input + error enlazados con `aria-describedby`/`aria-invalid`.
- `ListaSalas`, `Chat`, `PanelMensajes`, `ListaMensajes`: el chat. `ListaMensajes` es `role="log"` con `aria-live="polite"`.
- `PanelMensajes` usa **`useOptimistic`**: su mensaje aparece al instante como "Enviando…"; si la API lo rechaza, desaparece solo.
- `Estados`: `Cargando` (`role="status"`), `Vacio` y `Fallo` (`role="alert"`).

## src/app y el proxy

- `layout.tsx`: `lang="es"`, enlace "Saltar al contenido", `<header>`, `<nav>` y `<main>` (puntos de referencia para lectores de pantalla).
- `login`, `salas`, `salas/nueva`, `salas/[id]`, `perfil`, `error.tsx`, `not-found.tsx`.
- `proxy.ts` (antes `middleware`): si no hay cookie, redirige a `/login`. **Es comodidad, no seguridad**: la seguridad real
  es que la API verifica la cookie en cada petición.

## Decisiones que usted debe poder defender

1. **Sondeo corto y no SSE ni WebSocket**: más simple, funciona en Vercel y cumple "menos de 5 s" (2 s con la pestaña visible).
2. **`since` con 1 s de solape**: no se pierden mensajes guardados en el mismo milisegundo; los repetidos se descartan por `id`.
3. **Retroceso exponencial**: si el servidor cae, no se le bombardea con peticiones.
4. **Cookie HttpOnly y no localStorage**: un XSS no puede robarla.
5. **React escapa el texto**: un mensaje con `<script>` se ve como texto. Hay una prueba que lo demuestra.
6. **Mismos esquemas Zod en cliente y servidor**: una sola regla; el servidor igual la vuelve a validar.
7. **Accesibilidad**: foco visible, botones de 44 px, `aria-live`, etiquetas, contraste, `prefers-reduced-motion`, modo oscuro.
8. **CSS Modules** (un `.module.css` por componente): los estilos no se pisan entre componentes.

## Límites que conviene decir en voz alta

- Si el creador elimina un mensaje, las demás personas lo siguen viendo hasta recargar (el sondeo solo trae mensajes nuevos).
- El nombre visible sale del correo (parte antes de `@`) o del nombre de la cuenta; no hay edición de perfil.
- Las notificaciones del sistema dependen del navegador; el contador en el título siempre funciona.

## Pruebas nuevas (30)

- `cliente/polling.test.ts`: espera exponencial, máximo, orden y repetidos, marca `since`.
- `cliente/useMensajes.test.tsx`: **reloj falso**: carga + sondeo, reintentos 4 s y 8 s, 401 detiene, desmontar detiene.
- `cliente/autenticacion.test.ts`: redirecciones abiertas.
- `componentes/*`: Enter envía, Mayús+Enter no, vacío avisa, error de API, `role="log"`, texto sin HTML, moderación, login.
