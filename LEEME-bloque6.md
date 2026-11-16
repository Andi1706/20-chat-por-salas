# Bloque 6: arreglo de «Salas» y del login en producción

## Qué pasaba

En producción Next.js precarga los enlaces (`/salas`). Si la precarga ocurre **antes** de iniciar sesión,
el proxy responde «ve a /login» y Next guarda esa respuesta en memoria. Después de entrar, `router.push("/salas")`
reutiliza la respuesta guardada y te deja en /login. `/salas/nueva` no se precargó, por eso sí funcionaba.
En local (`npm run dev`) no hay precarga, por eso allá todo iba bien.

## Arreglo

`src/cliente/navegacion.ts` con `irA()`, que hace una navegación completa (el navegador pide la página de nuevo).
Se usa al iniciar y al cerrar sesión (`FormularioLogin`, `Encabezado`, `BarraLateral`).

## Pasos

```bash
cd ~/proyectos/20-chat-por-salas
tar -xzf "/mnt/c/Users/Go Andis/Downloads/bloque6.tar.gz" -C /tmp
cp -r /tmp/bloque6/src/. src/
cp -r /tmp/bloque6/tests/. tests/
cp /tmp/bloque6/LEEME-bloque6.md .
npm run format
npm run check
```

Debe terminar con **77 passed**. Luego:

```bash
git add -A
git commit -m "Navegación completa al entrar y salir para evitar la redirección guardada"
git push
```

Cuando Vercel marque Ready, prueba en incógnito: entrar → debe llevarte a /salas.
