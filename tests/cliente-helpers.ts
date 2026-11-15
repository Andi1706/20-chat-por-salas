import { vi } from "vitest";
import type { Mensaje } from "@/schemas/mensaje";

export function mensaje(id: string, creadoEn: string, cambios: Partial<Mensaje> = {}): Mensaje {
  return { id, uid: "u2", nombre: "Ana", texto: `texto ${id}`, creadoEn, ...cambios };
}

export function respuestaJson(cuerpo: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Sustituye `fetch` por un simulado; así las pruebas no necesitan servidor ni Firebase. */
export function simularFetch() {
  const simulado = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", simulado);
  return simulado;
}
