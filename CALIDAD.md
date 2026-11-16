# Calidad: Chat por salas

Sitio en producción: https://20-chat-por-salas.vercel.app
Mediciones hechas el 2026-11-16 con Chrome DevTools (Lighthouse), tal como se muestra en las capturas de `calidad/evidencias/`.

## 1. Lighthouse en producción (antes de las mejoras de la sección 3)

| Página                      | Dispositivo | Performance | Accesibilidad | Buenas prácticas | SEO | Captura                            |
| --------------------------- | ----------- | ----------- | ------------- | ---------------- | --- | ---------------------------------- |
| `/login` (pública)          | Móvil       | 62          | 100           | 92               | 100 | `lighthouse-mobile-login.png`      |
| `/login` (pública)          | Escritorio  | 99          | 100           | 92               | 100 | `lighthouse-desktop-login.png`     |
| `/salas/nueva` (formulario) | Móvil       | 79          | 100           | 96               | 63  | `lighthouse-mobile-salanueva.png`  |
| `/salas/nueva` (formulario) | Escritorio  | 99          | 100           | 96               | 63  | `lighthouse-desktop-salanueva.png` |
| `/salas` (lista y chat)     | Móvil       | 72          | 100           | 96               | 63  | `lighthouse-mobile-sala.png`       |
| `/salas` (lista y chat)     | Escritorio  | 96          | 100           | 96               | 63  | `lighthouse-desktop-sala.png`      |

### Lectura de los resultados

- **Accesibilidad 100 en las 6 mediciones.**
- **SEO 63 en las páginas con sesión: decisión de diseño.** `robots.txt` bloquea `/salas` y `/perfil` porque son privadas, y Lighthouse lo reporta como «página no indexable». En `/login`, la única pública, el SEO es 100.
- **Performance móvil más bajo.** Lighthouse móvil simula red lenta y un procesador 4 veces más lento. Además, en la medición aparecieron avisos de que extensiones de Chrome y datos guardados (IndexedDB) afectaron el resultado. En escritorio (96 a 99) no se ve el problema.
- **Buenas prácticas 92 en `/login`:** había un error en consola (`GET /api/auth/yo 401`) porque la app preguntaba por la sesión antes de que existiera. Se corrigió después (ver sección 3).

### Métricas leídas en las capturas

| Página         | Dispositivo | FCP   | LCP   |
| -------------- | ----------- | ----- | ----- |
| `/login`       | Móvil       | 1,5 s | 3,5 s |
| `/login`       | Escritorio  | 0,5 s | 0,7 s |
| `/salas/nueva` | Móvil       | 1,6 s | 1,7 s |
| `/salas/nueva` | Escritorio  | 0,4 s | 0,5 s |
| `/salas`       | Escritorio  | 0,5 s | 0,6 s |

CLS e INP: no medidos. Lighthouse en modo carga de página no reporta INP, y la medición posterior a las mejoras de la sección 3 no se repitió, por lo que no hay una tabla «después» de Lighthouse. El «antes y después» medido es el del peso del JavaScript (sección 2).

## 2. Peso de la página

Medido sobre la compilación de producción, con compresión:

| Momento                                           | JavaScript comprimido en `/login` | Límite |
| ------------------------------------------------- | --------------------------------- | ------ |
| Antes (Firebase en todas las páginas)             | ~203 kB                           | 200 kB |
| Después (Firebase se descarga al pulsar «Entrar») | ~172 kB                           | 200 kB |

Página completa (HTML, CSS, JS): ~182 kB, por debajo del límite de 1 MB.

## 3. Mejoras hechas a partir de las mediciones

| Problema                                           | Causa                                                                                  | Arreglo                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| JS por encima de 200 kB                            | El SDK de Firebase Auth (~30 kB) se descargaba en todas las páginas                    | `import()` dinámico: solo se descarga al enviar el formulario de entrada |
| Error 401 en la consola de `/login`                | La app consultaba `/api/auth/yo` sin sesión                                            | En `/login` no se consulta la sesión                                     |
| «Salas» no abría tras iniciar sesión en producción | Next.js guardaba la redirección a `/login` que dio el proxy cuando aún no había sesión | Tras entrar o salir se usa una navegación completa (`irA`)               |

## 4. Accesibilidad

- **Automática (axe-core) en pruebas de Vitest:** `tests/componentes/accesibilidad.test.tsx` revisa formulario de entrada, formulario de mensaje, lista de mensajes, estados de carga/vacío/error y pie de página. Se ejecuta con `npm run check`.
- Estructura: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, enlace «Saltar al contenido», `lang="es"`.
- Chat: `role="log"` con `aria-live="polite"`; estados con `role="status"` y errores con `role="alert"`.
- Foco visible, botones de al menos 44 px, `prefers-reduced-motion`, modo oscuro, `prefers-contrast: more` y `forced-colors`.

### Revisión manual

| Prueba                                                                   | Cómo se hizo                                                                   | Fecha      | Resultado                                                                                  |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------ |
| Teclado: recorrer login, lista de salas y chat solo con Tab, Enter y Esc | Recorrido sin usar el mouse en login, lista de salas y chat                    | 2026-11-16 | Sin problemas: se pudo llegar a todo y siempre se veía el foco                             |
| Zoom al 200 %: no hay texto cortado ni scroll horizontal                 | Ctrl y + hasta 200 % en login, lista de salas y chat                           | 2026-11-16 | Sin problemas: nada se corta y no hay scroll horizontal                                    |
| Lector de pantalla (NVDA): se anuncia un mensaje nuevo en el chat        | NVDA en una ventana con la sala abierta y un mensaje enviado desde otra sesión | 2026-11-16 | Lo anunció: NVDA leyó el mensaje nuevo en unos segundos                                    |
| Validador de HTML W3C (https://validator.w3.org/) en `/login`            | Nu Html Checker, «Validate by URI»                                             | 2026-11-16 | 0 errores y 0 avisos (solo mensajes informativos sobre la barra final en elementos vacíos) |

## 5. Diseño responsivo

Capturas en `calidad/evidencias/`: `ancho-360.png`, `ancho-768.png` y `ancho-1024.png`.
Una columna en 360 px (lista y chat en pantallas separadas); dos paneles desde 768 px.

## 6. Retos de calidad elegidos

1. **axe-core automático en Vitest** (sección 4). Evidencia: `tests/componentes/accesibilidad.test.tsx`.
2. **Cabeceras de seguridad y CSP.** `next.config.ts` y `src/lib/cabeceras.ts`, con prueba en `tests/cabeceras.test.ts`. Evidencia: `calidad/evidencias/cabeceras.png`.
3. **Reducción del JavaScript inicial** (secciones 2 y 3).
4. **Modo oscuro, contraste alto, colores forzados e impresión** en `src/app/globals.css`. Evidencia de impresión: `calidad/evidencias/impresion.png`.

## 7. Calidad del código

`npm run check` ejecuta, en este orden: TypeScript estricto, ESLint (complejidad ≤ 10, funciones ≤ 50 líneas, archivos ≤ 300), Prettier y Vitest con umbrales de cobertura. Última ejecución: 77 pruebas en verde; cobertura de servicios 94 %.
Colección de Bruno (16 solicitudes) en verde contra producción: `calidad/evidencias/bruno-produccion-16-verdes.png`.
