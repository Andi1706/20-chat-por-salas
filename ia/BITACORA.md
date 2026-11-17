# Bitácora de IA

Uso un asistente de IA para construir este proyecto. La IA propone y yo decido: cada propuesta se comprueba con `npm run check`, con el navegador o con una prueba, y estos son los casos en que tuve que corregir o rechazar lo que propuso.

## Casos en que corregí o rechacé lo propuesto por la IA

1. **Node de Windows dentro de WSL.** Los comandos de creación fallaron porque Ubuntu usaba el Node de Windows. Instalé Node con nvm dentro de Ubuntu.
2. **npm sugirió `--force`.** Rechacé la sugerencia porque instala una mezcla de versiones incompatible. Subí `@types/node` a la versión 24, que sí cumple lo que pide vitest.
3. **`npm run check` falla sin pruebas.** El script `check` incluye `test`, pero aún no existían pruebas. Lo resolví en el bloque 2 con las pruebas de API, servicios e integración (`4dcd406`).
4. **Token filtrado.** Pegué un token de GitHub en el chat con la IA. Lo revoqué en GitHub y creé uno nuevo. Desde entonces los secretos solo se escriben en la terminal o en el panel de Vercel, nunca en el chat.
5. **El lint rechazó el código de ejemplo de Next.js.** Tenía funciones de más de 50 líneas y ESLint lo rechazó. Lo reemplacé por funciones pequeñas; después hice lo mismo con los hooks del chat (`useMensajes` se dividió en varias piezas).
6. **Cache Components.** Desactivé esta función de Next.js y ajusté la página de inicio (`650ceb5`): no la necesitaba y cambiaba cómo se renderizan las páginas.
7. **Nombre de la base de Firestore.** El código asumía la base `(default)`, pero la mía se llama `default`. Agregué la variable `FIRESTORE_DATABASE_ID` (`7f50655`).
8. **CSS sin estilos.** La página se veía sin diseño porque una regla de Tailwind en `next.config.ts` interceptaba los archivos `.css` y rompía los CSS Modules. Dejé la configuración vacía y borré `.next`. Lo verifiqué abriendo la página.
9. **Documentación equivocada en OpenAPI.** El test de contrato (que compara `openapi.yaml` con las rutas reales) mostró que `DELETE /api/auth/sesion` estaba documentado como si exigiera sesión. Corregí el contrato con `security: []` (`0849870`).
10. **Prueba de ráfaga de Bruno.** La solicitud 11 esperaba un `429`, pero devolvía `201`, porque cada petición tarda más de 1 s y la regla permite 1 mensaje por segundo. La reescribí para lanzar 5 peticiones a la vez. Comprobé que queden 16 de 16 en verde (`f60033a`).
11. **Versión de Node en Vercel.** La IA propuso `"engines": ">=22.12"` y Vercel eligió Node **26.x**. Lo cambié a `22.x` (`07c228a`). Además, el fallo original en Vercel no era solo de versión: mis variables de entorno no tenían los valores guardados. Los revisé y los volví a registrar. También fijé `jose` a 4.15.9 (`1ee777a`); con Node 22 ya no hace falta, pero lo dejo y lo anoto.
12. **«Salas» no abría en producción.** Tras iniciar sesión, el botón «Salas» me devolvía a `/login`; en local funcionaba. Next.js guardaba en memoria la redirección que dio el proxy cuando aún no había sesión. Reemplacé `router.push` por una navegación completa al entrar y salir (`579f449`).
13. **Comando `sed` que duplicó el dominio.** Al poner la URL de producción, el marcador ya terminaba en `.vercel.app` y quedó `.vercel.app.vercel.app`. Lo vi con `grep` y lo corregí antes de seguir.
14. **Archivo suelto que rompía el formato.** Un comando mal pegado dejó un archivo `oncat package.json` en el repositorio. `npm run format:check` lo detectó y lo borré (`354f998`).

## Registro de uso

| Fecha      | Propósito                                                   | Evidencia                       | Validación                                                       | Decisión                                   |
| ---------- | ----------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------ |
| 2026-11-14 | Configuración de IA, calidad y scripts                      | `f3afe00`                       | Revisé cada archivo                                              | Adaptado con mis cambios                   |
| 2026-11-14 | API por capas: esquemas Zod, repositorios, servicios, rutas | `9eb7d35`, `d27dc23`, `1fa9f19` | Pruebas de API, servicios e integración (`4dcd406`)              | Aceptado; ajusté la base de datos (caso 7) |
| 2026-11-15 | Interfaz de dos paneles, sondeo y hooks                     | `a0b5ccd`                       | `npm run check` y revisión en el navegador                       | Aceptado tras refactor por lint (caso 5)   |
| 2026-11-15 | OpenAPI y colección de Bruno                                | `0849870`, `f60033a`            | Test de contrato y Bruno 16/16 en verde                          | Corregidos casos 9 y 10                    |
| 2026-11-16 | Cabeceras de seguridad, estados de carga, SEO, pruebas axe  | `1297914`                       | `npm run check` y navegador sin errores de CSP                   | Aceptado                                   |
| 2026-11-16 | Despliegue en Vercel y diagnóstico del error de producción  | `3bead69`, `07c228a`, `1ee777a` | Registros de Vercel e inicio de sesión en producción             | Corregido (caso 11)                        |
| 2026-11-16 | Arreglo de la redirección guardada                          | `579f449`                       | Reproducido en una compilación de producción y probado en Vercel | Aceptado (caso 12)                         |
| 2026-11-16 | Mejoras tras Lighthouse: Firebase bajo demanda              | `eadf9b6`                       | JavaScript de 203 kB a 172 kB medido en producción local         | Aceptado                                   |
| 2026-11-16 | Informe de calidad (`CALIDAD.md`)                           | `f3039a9`, `b1a11ff`            | Pruebas manuales hechas por mí y mediciones propias              | Texto revisado con mis resultados          |
| 2026-11-16 | README                                                      | `3a27b4b`                       | Comprobé que todo lo que dice es cierto en el proyecto           | Aceptado                                   |

## Lo que aprendí

- Una sugerencia de la IA puede parecer correcta y fallar en otro entorno (como la redirección guardada, que solo fallaba en producción).
- Los chequeos automáticos (`check`, test de contrato, Bruno) encontraron errores que yo no habría visto leyendo el código.
- Después de cualquier comando que cambia archivos, lo verifico (`grep`, `git status`) antes de seguir.
- Los secretos nunca se pegan en el chat con la IA.
