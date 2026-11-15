import type { Mensaje } from "@/schemas/mensaje";

/** Con la pestaña a la vista se consulta cada 2 s (la meta es ver mensajes en menos de 5 s). */
export const ESPERA_VISIBLE_MS = 2000;
/** Con la pestaña oculta se consulta menos, pero sigue por debajo de 5 s para poder avisar. */
export const ESPERA_OCULTA_MS = 4000;
export const ESPERA_MAXIMA_MS = 30000;
/** Fecha más antigua posible: sirve como `since` cuando la sala aún no tiene mensajes. */
export const DESDE_EL_PRINCIPIO = "1970-01-01T00:00:00.000Z";
const SOLAPE_MS = 1000;

/**
 * Espera hasta la próxima consulta. Cada fallo seguido duplica la espera (retroceso exponencial)
 * hasta un máximo, para no saturar al servidor mientras está caído.
 */
export function calcularEspera(fallos: number, visible: boolean): number {
  const base = visible ? ESPERA_VISIBLE_MS : ESPERA_OCULTA_MS;
  return Math.min(base * 2 ** fallos, ESPERA_MAXIMA_MS);
}

/** Junta listas de mensajes sin repetir ids y en orden cronológico. */
export function combinarMensajes<T extends Mensaje>(actuales: T[], nuevos: T[]): T[] {
  const porId = new Map<string, T>();
  for (const mensaje of [...actuales, ...nuevos]) porId.set(mensaje.id, mensaje);
  return [...porId.values()].sort(
    (a, b) => a.creadoEn.localeCompare(b.creadoEn) || a.id.localeCompare(b.id),
  );
}

/**
 * Marca para el próximo `?since=`: la fecha del mensaje más nuevo menos 1 s.
 * El solape evita perder mensajes que se guardan en el mismo milisegundo;
 * los repetidos se descartan en `combinarMensajes` porque comparten id.
 */
export function marcaDeSondeo(mensajes: Mensaje[]): string {
  const ultimo = mensajes.at(-1);
  if (!ultimo) return DESDE_EL_PRINCIPIO;
  const milisegundos = Date.parse(ultimo.creadoEn) - SOLAPE_MS;
  return new Date(Math.max(milisegundos, 0)).toISOString();
}
