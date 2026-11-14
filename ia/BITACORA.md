# Bitácora de IA

## Casos en que corregí o rechacé lo propuesto por la IA
1. **Node de Windows dentro de WSL.** Los comandos de creación fallaron porque Ubuntu usaba el Node de Windows. Instalé Node con nvm dentro de Ubuntu.
2. **npm sugirió `--force`.** Rechacé la sugerencia porque instala una mezcla de versiones incompatible. Subí `@types/node` a la versión 24, que sí cumple lo que pide vitest.
3. **`npm run check` falla sin pruebas.** El script `check` incluye `test`, pero aún no existen pruebas. Lo resuelvo en el bloque 2.
4. Token filtrado

## Registro de uso
| Fecha | Propósito | Evidencia | Validación | Decisión |
|---|---|---|---|---|
| 2026-11-14 | Configuración de IA, calidad y scripts | Primer commit | Revisé cada archivo | Adaptado con mis cambios |
