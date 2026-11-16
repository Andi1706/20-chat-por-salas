# Bloque 3b · Diseño estilo chat de escritorio (paso a paso)

Todos los comandos se escriben en Ubuntu, dentro de `~/proyectos/20-chat-por-salas`, **uno por uno**.
Si `npm run dev` está corriendo en esa terminal, deténgalo primero con `Ctrl+C`.

## 1. Copiar los archivos

```bash
cd ~/proyectos/20-chat-por-salas
```

```bash
cp "/mnt/c/Users/Go Andis/Downloads/bloque3b.tar.gz" .
```

```bash
tar xzf bloque3b.tar.gz
```

```bash
cp -r bloque3b/. .
```

```bash
rm -rf bloque3b bloque3b.tar.gz
```

## 2. Borrar los 2 archivos que ya no se usan

La lista de salas ahora vive en la barra lateral.

```bash
rm src/components/ListaSalas.tsx src/components/ListaSalas.module.css
```

## 3. Comprobar

```bash
npm run format
```

```bash
npm run check
```

Debe terminar sin errores y con **60 pruebas** pasando.

## 4. Verlo

```bash
npm run dev
```

Abra http://localhost:3000. Ahora, en pantalla ancha: lista de salas a la izquierda, chat a la derecha.
Pruebe: buscar una sala, abrir una, escribir, el botón "+" (nueva sala), y achicar la ventana para ver la versión de celular
(un panel a la vez, con flecha para volver).

## 5. Commit

```bash
git add src tests
git commit -m "feat: diseño de dos paneles estilo chat de escritorio"
```

```bash
git push
```

## Qué cambió (para la sustentación)

- `MarcoSalas` + `BarraLateral`: estructura de dos paneles; en celular se ve uno a la vez según la ruta (`usePathname`).
- `Avatar` (iniciales y color calculado del nombre), `Iconos` (SVG con `aria-hidden`).
- `cliente/filas.ts`: separadores "Hoy/Ayer" y agrupar mensajes seguidos de la misma persona. Tiene pruebas.
- `ListaMensajes`: burbujas, nombre solo en el primer mensaje de la racha, "Eliminar" visible al pasar el mouse o con el teclado.
- `FormularioMensaje`: barra redonda con botón de enviar; el contador aparece al pasar de 400 caracteres.
- El encabezado global se oculta en `/salas` (la barra lateral trae perfil y "Salir").
