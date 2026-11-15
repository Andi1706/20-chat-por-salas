import type { ZodError } from "zod";

/** Convierte los errores de Zod en `{ campo: mensaje }` para pintar cada error junto a su campo. */
export function erroresPorCampo(error: ZodError): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const problema of error.issues) {
    const campo = String(problema.path[0] ?? "formulario");
    resultado[campo] ??= problema.message;
  }
  return resultado;
}
