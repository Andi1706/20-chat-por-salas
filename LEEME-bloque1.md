# Bloque 1 · Cómo aplicarlo

## 0. Importante: Windows
El sandbox de la IA NO existe en Windows nativo. Trabaje en **WSL2 (Ubuntu)**:
```bash
sudo apt-get update && sudo apt-get install -y bubblewrap socat
```
Ponga el proyecto dentro de WSL (por ejemplo `~/proyectos/20-chat-por-salas`), no en `/mnt/c/...`.
Abra la IA SIEMPRE en la raíz del repositorio.

## 1. Crear el proyecto
```bash
npx create-next-app@latest 20-chat-por-salas --ts --app --eslint --src-dir
cd 20-chat-por-salas
git init   # si create-next-app no lo hizo ya
```

## 2. Copiar los archivos de este bloque a la raíz
`AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.gitignore` (reemplaza el existente),
`env.example`, `eslint.config.mjs` (reemplaza el existente), `.prettierrc`, `.editorconfig`.
Cree también la carpeta `ia/` con un archivo `BITACORA.md` vacío por ahora.

## 3. Dependencias de calidad
```bash
npm i firebase firebase-admin zod
npm i -D vitest @vitest/coverage-v8 @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom prettier
```

## 4. Scripts en package.json (sección "scripts")
```json
"typecheck": "tsc --noEmit",
"lint": "eslint . --max-warnings 0",
"format": "prettier --write .",
"format:check": "prettier --check .",
"test": "vitest run --coverage",
"check": "npm run typecheck && npm run lint && npm run format:check && npm run test"
```
En `tsconfig.json`, dentro de `compilerOptions`, agregue `"strict": true` (ya viene) y `"noUncheckedIndexedAccess": true`.

Nota: `npm run test` y `check` fallarán hasta que exista una primera prueba y `vitest.config.ts`.
Mientras tanto no incluya `test` en `check`, o cree la prueba mínima en el bloque 2.

## 5. Primer commit (el historial lo comprueba)
```bash
git add AGENTS.md CLAUDE.md .claude .gitignore env.example eslint.config.mjs .prettierrc .editorconfig package.json package-lock.json tsconfig.json
git commit -m "chore: configuración de IA, reglas de calidad y scripts"
```
Verifique con `git status` que NO aparezca ningún `.env*`.

## 6. Lo que debe hacer usted (es parte de la nota)
- Lea `AGENTS.md` y `.claude/settings.json` y adáptelos con sus palabras. Debe poder explicar cada regla.
- La sintaxis de `settings.json` puede cambiar según la versión de Claude Code: compárela con la documentación de la suya.
- Cree `.env.local` de prueba con `CANARIO=ZZZ-NO-ES-UN-SECRETO` y haga las 10 pruebas de contención de la hoja (punto 9). Guárdelas en `ia/PRUEBAS-CONTENCION.md` con captura.
- Use un proyecto de Firebase solo de desarrollo; los secretos de producción viven solo en Vercel.
