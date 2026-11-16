# Bloque 3 · Las pantallas (paso a paso)

Todos los comandos se escriben en Ubuntu, dentro de `~/proyectos/20-chat-por-salas`, **uno por uno**.
Si tiene `npm run dev` corriendo en esa terminal, detenga primero con `Ctrl+C`.

## 1. Copiar los archivos

```bash
cd ~/proyectos/20-chat-por-salas
```

```bash
cp "/mnt/c/Users/Go Andis/Downloads/bloque3.tar.gz" .
```

```bash
tar xzf bloque3.tar.gz
```

```bash
cp -r bloque3/. .
```

```bash
rm -rf bloque3 bloque3.tar.gz
```

Esto reemplaza `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/api/auth/yo/route.ts`
y `vitest.config.ts`, y agrega las carpetas nuevas `src/cliente`, `src/hooks`, `src/components` y las páginas.

## 2. Instalar lo que falta (para las pruebas de pantalla)

```bash
npm install firebase
```

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Si `firebase` ya estaba, el primer comando no cambia nada. No use `--force`: si npm da un error ERESOLVE, péguemelo.

## 3. Formatear y comprobar

```bash
npm run format
```

```bash
npm run check
```

Debe terminar sin errores y con **54 pruebas** pasando. Si algo falla, pégueme el texto del error.

## 4. Ver la aplicación

```bash
npm run dev
```

Abra http://localhost:3000 en el navegador. Como no tiene sesión, lo lleva solo a `/login`.

Pruebe en este orden:

1. **Entrar** con `prueba@ejemplo.com` y su contraseña. Lo lleva a `/salas`.
2. **Nueva sala**: cree una (por ejemplo "General"). Lo lleva al chat de esa sala.
3. **Escriba un mensaje** y presione Enter. Aparece "Enviando…" un instante y luego queda normal.
4. **Segunda persona**: abra una ventana de incógnito (Ctrl+Shift+N), vaya a http://localhost:3000, elija
   "No tengo cuenta: crear una" y regístrese con otro correo (por ejemplo `ana@ejemplo.com`).
   Entre a la sala "General" (en "Salas" > "Públicas"), presione **Unirme a la sala** y escriba.
5. Vuelva a la primera ventana: el mensaje de Ana debe aparecer solo, en menos de 5 segundos.
6. **Avisos**: presione "Activar avisos", cambie a otra pestaña y pida a la otra ventana que escriba.
   La pestaña muestra `(1) Chat por salas` aunque no haya permiso de notificaciones.
7. **Moderar**: el creador de la sala ve el botón "Eliminar" en cada mensaje; los demás no.
8. **Perfil** y **Salir**.

Para detener el servidor: `Ctrl+C`.

## 5. Commits pequeños (el profe revisa el historial)

```bash
git add src/cliente src/hooks
git commit -m "feat: cliente de la API, sondeo con reintentos y avisos"
```

```bash
git add src/components src/app src/proxy.ts
git commit -m "feat: pantallas de login, salas, chat y perfil"
```

```bash
git add tests vitest.config.ts package.json package-lock.json
git commit -m "test: pruebas del sondeo y de los componentes"
```

```bash
git status
```

`git status` debe quedar limpio, salvo las guías (`LEEME-*.md`, `EXPLICACION-*.md`) si decide no subirlas.
Luego `git push`. (Si el push le pide usuario y contraseña, use su token NUEVO y nunca lo pegue en el chat.)

## 6. Lo que debe hacer usted (es parte de la nota)

- Lea `EXPLICACION-bloque3.md` y abra cada archivo: debe poder explicar cada línea en vivo.
- Anote en `ia/BITACORA.md` qué revisó. Casos buenos de esta entrega para sus 3 correcciones:
  1. Mis primeras versiones de `crearSondeo`, `useMensajes` y los formularios pasaban de 50 líneas y
     **el linter las rechazó**; hubo que partirlas (una clase `Sondeo`, hooks más pequeños).
  2. El hook de salas tenía un `!= null`; la regla `eqeqeq` lo rechazó.
  3. Revise usted mismo algo que haya cambiado o no entienda y anótelo con sus palabras.
- Esto se probó con la API simulada en el navegador (no contra su Firebase). Si algo falla al conectarlo, pégueme el error.
