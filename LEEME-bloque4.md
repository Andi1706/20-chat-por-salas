# Bloque 4 · Contrato de la API (openapi.yaml) y colección de Bruno

Todos los comandos se escriben en Ubuntu, dentro de `~/proyectos/20-chat-por-salas`, **uno por uno**.

## 1. Copiar los archivos

```bash
cd ~/proyectos/20-chat-por-salas
```

```bash
cp "/mnt/c/Users/Go Andis/Downloads/bloque4.tar.gz" .
```

```bash
tar xzf bloque4.tar.gz
```

```bash
cp -r bloque4/. .
```

```bash
rm -rf bloque4 bloque4.tar.gz
```

Quedan nuevos: `openapi.yaml`, la carpeta `bruno/` y `tests/openapi.test.ts`.

## 2. Instalar la librería que lee el YAML (solo para la prueba)

```bash
npm install -D yaml
```

## 3. Comprobar

```bash
npm run format
```

```bash
npm run check
```

Debe terminar sin errores y con **64 pruebas**. Cuatro de ellas comprueban que `openapi.yaml` y las rutas reales
de `src/app/api` coinciden: si alguien agrega una ruta y olvida documentarla, el `check` se rompe.

## 4. Commit

```bash
git add openapi.yaml bruno tests package.json package-lock.json
```

```bash
git commit -m "docs: contrato OpenAPI, colección de Bruno y prueba de contrato"
```

```bash
git push
```

## 5. Usar la colección en Bruno (la necesita para la evidencia)

1. Instale **Bruno** en Windows desde https://www.usebruno.com/downloads (es gratis).
2. Deje el servidor encendido en una terminal de Ubuntu: `npm run dev`.
3. En Bruno: **Open Collection** y pegue esta ruta (en el explorador de Windows):
   `\\wsl$\Ubuntu\home\go_andis\proyectos\20-chat-por-salas\bruno`
4. Arriba a la derecha elija el entorno **local** y abra "Configure":
   - `apiKey`: el valor de `NEXT_PUBLIC_FIREBASE_API_KEY` de su `.env.local` (es una clave pública, no un secreto).
   - `clave`: la contraseña de `prueba@ejemplo.com`. Bruno la guarda solo en su computador (no queda en los archivos ni en Git).
5. Ejecute **00 Obtener idToken** primero; después clic derecho en la colección > **Run**: se ejecutan las 16 peticiones
   con sus verificaciones (`assert`). Todas deben salir en verde.
6. Tome una captura de pantalla del resultado verde: es evidencia para `calidad/`.

Si "11 Segundo mensaje inmediato (429)" sale 201 en vez de 429, es porque pasó más de 1 segundo entre las dos
peticiones; vuelva a ejecutar la colección.

## 6. Lo que debe hacer usted

- Abra `openapi.yaml` y pregúntese por cada ruta: ¿qué código devuelve y por qué? Debe poder explicarlo.
- Anote en `ia/BITACORA.md`: la prueba de contrato encontró que yo había documentado "cerrar sesión" como si exigiera
  autenticación, y el código real responde 204 aunque no haya sesión (es idempotente). Se corrigió el documento. Buen caso de corrección.
- Más adelante, al desplegar en Vercel, reemplace `REEMPLAZAR-CON-LA-URL-DE-VERCEL` en `openapi.yaml` y en `bruno/environments/produccion.bru`.
