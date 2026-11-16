# Bloque 5: cumplir el enunciado (seguridad, estados, SEO, accesibilidad)

## Qué cambia

| Cambio                                                          | Para qué (criterio del enunciado)                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `next.config.ts` + `src/lib/cabeceras.ts`                       | Cabeceras de seguridad: CSP, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy |
| `PanelMensajes.tsx`                                             | Muestra «Reconectando…» cuando falla el sondeo (criterio de aceptación 2)                  |
| `Estados.tsx` / `.module.css`                                   | Esqueletos de carga (mensajes y salas) en vez de solo texto                                |
| `PieDePagina.tsx`, `BarraLateral.tsx`                           | Landmark `<footer>` en todas las páginas                                                   |
| `app/loading.tsx`                                               | Estado de carga de las rutas                                                               |
| `app/robots.ts`, `app/sitemap.ts`, `lib/sitio.ts`, `layout.tsx` | SEO: robots, sitemap, Open Graph, `metadataBase`                                           |
| `globals.css`                                                   | Contraste alto, colores forzados e impresión                                               |
| `tests/cabeceras.test.ts`                                       | Prueba de las cabeceras                                                                    |
| `tests/componentes/accesibilidad.test.tsx`                      | axe automático sobre 5 grupos de componentes (reto de calidad)                             |
| `tests/componentes/PanelMensajes.test.tsx`                      | Prueba de «Reconectando…» y del esqueleto                                                  |

## Pasos (en WSL, dentro de `~/proyectos/20-chat-por-salas`)

1. Descomprimir y copiar encima (ajusta la ruta si el archivo está en otro sitio):

```bash
cd ~/proyectos/20-chat-por-salas
tar -xzf "/mnt/c/Users/Go Andis/Downloads/bloque5.tar.gz" -C /tmp
cp -r /tmp/bloque5/src/. src/
cp -r /tmp/bloque5/tests/. tests/
cp /tmp/bloque5/next.config.ts .
cp /tmp/bloque5/LEEME-bloque5.md .
```

2. Instalar axe-core (herramienta de accesibilidad, solo para pruebas):

```bash
npm install -D axe-core
```

3. Formatear y comprobar todo:

```bash
npm run format
npm run check
```

Debe terminar con **76 passed**. Si sale algo en rojo, pégame el texto.

4. Reiniciar el servidor de desarrollo (Ctrl+C y de nuevo) porque cambió `next.config.ts`:

```bash
npm run dev
```

Entra a http://localhost:3000, inicia sesión y comprueba que el chat sigue funcionando. Abre la consola del navegador (F12): no debe haber errores rojos que mencionen "Content Security Policy".

5. Ver las cabeceras (con el servidor en marcha, en otra terminal):

```bash
curl -sI http://localhost:3000/login | grep -iE "content-security|x-content|referrer|x-frame|permissions"
curl -s http://localhost:3000/robots.txt
```

Guarda una captura de esa salida en `calidad/evidencias/cabeceras.png` (sirve de evidencia).

6. Commit y push:

```bash
git add -A
git commit -m "Cabeceras de seguridad, estados de carga, footer, SEO y pruebas axe"
git push
```

(Si te pide usuario y token, usa tu token de GitHub; no lo pegues en el chat.)

## Para explicar en la sustentación

- **CSP**: lista blanca de orígenes. Solo se permite conectar con el propio sitio y con los dominios de Firebase Auth; nadie puede embeber la página (`frame-ancestors 'none'`).
- **Dev vs producción**: en desarrollo la CSP añade `unsafe-eval` y websockets porque React y el recargado en caliente los necesitan; en producción no.
- **axe en Vitest**: jsdom no calcula colores, por eso el contraste se mide aparte con Lighthouse y axe en el navegador real.

## Sigue

Desplegar en Vercel (variables de entorno, dominio autorizado en Firebase) y medir Lighthouse en producción.
