# Bloque 7: mejoras de rendimiento tras Lighthouse

## Qué se encontró

- El JavaScript de `/login` y `/salas/nueva` pesaba ~203 kB comprimido (el límite del enunciado es 200 kB).
  Causa: el SDK de Firebase Auth (~30 kB) se descargaba en todas las páginas, aunque solo se usa al enviar el formulario de entrada.
- `/login` mostraba un error rojo en la consola (`GET /api/auth/yo 401`) porque la app preguntaba por la sesión antes de que existiera.
  Lighthouse lo penaliza en Best Practices (92).

## Qué cambia

- `src/cliente/firebase.ts` y `src/cliente/autenticacion.ts`: Firebase se carga con `import()` dinámico, solo cuando se envía el formulario.
- `src/components/ProveedorUsuario.tsx`: en `/login` no se consulta `/api/auth/yo`.

## Resultado medido (compilación de producción local)

- JS comprimido: 203 kB → ~172 kB (-15 %).
- Errores en la consola de `/login`: 1 → 0.

## Pasos

```bash
cd ~/proyectos/20-chat-por-salas
tar -xzf "/mnt/c/Users/Go Andis/Downloads/bloque7.tar.gz" -C /tmp
cp -r /tmp/bloque7/src/. src/
cp /tmp/bloque7/LEEME-bloque7.md .
npm run format
npm run check
```

Debe terminar con **77 passed**. Luego:

```bash
git add -A
git commit -m "Cargar Firebase bajo demanda y no consultar la sesión en /login"
git push
```

Cuando Vercel marque Ready, entra, inicia sesión y comprueba que sigue funcionando (el SDK se descarga al pulsar Entrar).
