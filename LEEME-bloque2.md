# Bloque 2 · Cómo aplicarlo (paso a paso)

Todos los comandos se escriben en Ubuntu, dentro de `~/proyectos/20-chat-por-salas`, **uno por uno**.

## 1. Copiar los archivos

```bash
cp "/mnt/c/Users/Go Andis/Downloads/bloque2.tar.gz" .
tar xzf bloque2.tar.gz
cp -r bloque2/. .
rm -rf bloque2 bloque2.tar.gz
```

Quedan nuevos: `src/lib`, `src/schemas`, `src/repositories`, `src/services`, `src/app/api`,
`tests/`, `vitest.config.ts`, `firestore.rules`, `firestore.indexes.json`, `firebase.json`.

## 2. Corregir una línea de AGENTS.md

Con `--src-dir`, la carpeta `app` está dentro de `src`. Cambie esa línea:

```bash
sed -i 's#`app/` páginas y Route Handlers (`app/api#`src/app/` páginas y Route Handlers (`src/app/api#' AGENTS.md
```

## 3. Formatear y comprobar la calidad

```bash
npm run format
npm run check
```

`npm run check` debe terminar sin errores (typecheck, lint, formato y 24 pruebas con cobertura).
Si algo falla, copie el error y pégueme el texto.

## 4. Prueba rápida de que la API responde

En una terminal: `npm run dev`. En OTRA terminal de Ubuntu:

```bash
curl -i http://localhost:3000/api/auth/yo
```

Debe responder `401` y `{"error":"No autenticado"}`. Eso confirma que las rutas existen y exigen sesión.
(Detenga el servidor con Ctrl+C.)

## 5. Variables de entorno (solo en su computador)

```bash
cp env.example .env.local
```

Abra `.env.local` en un editor y reemplace los valores falsos por los de su proyecto de Firebase **de desarrollo**.
NUNCA suba `.env.local` a Git ni pegue su contenido en un chat o en un prompt.
La clave privada va entre comillas, en una sola línea, con `\n` literales.

## 6. Reglas e índices de Firestore

Las reglas niegan todo (el navegador no habla con Firestore) y los índices hacen falta para listar salas.

```bash
npx firebase-tools login --no-localhost
npx firebase-tools deploy --only firestore --project SU_PROJECT_ID
```

Cambie `SU_PROJECT_ID` por el id de su proyecto. Sin los índices, listar salas falla con un error 500.

## 7. Commits pequeños (el profe revisa el historial)

```bash
git add src/lib src/schemas
git commit -m "feat: esquemas Zod y utilidades de la API"
git add src/repositories src/services firestore.rules firestore.indexes.json firebase.json
git commit -m "feat: repositorios, servicios y reglas de Firestore"
git add src/app/api
git commit -m "feat: rutas de la API de salas, mensajes y sesión"
git add tests vitest.config.ts package.json package-lock.json AGENTS.md
git commit -m "test: pruebas de API, servicios e integración"
git status
```

`git status` debe quedar limpio, salvo `LEEME-bloque2.md` y `EXPLICACION-bloque2.md` si decide no subirlos.
Luego `git push` (con su token nuevo).

## 8. Lo que debe hacer usted (es parte de la nota)

- Lea `EXPLICACION-bloque2.md` y abra cada archivo. Debe poder explicar cada línea en vivo.
- Anote en `ia/BITACORA.md` qué revisó y cualquier cosa que cambie o rechace.
- Esto se probó con pruebas simuladas, NO contra su Firebase real. Si algo falla al conectarlo, pegue el error.
