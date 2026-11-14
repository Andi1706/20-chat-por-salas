import type { Sala } from "@/schemas/sala";

interface Opciones {
  cuerpo?: unknown;
  /** null = petición sin credenciales. */
  token?: string | null;
}

export function pedir(metodo: string, ruta: string, opciones: Opciones = {}): Request {
  const cabeceras: Record<string, string> = { "content-type": "application/json" };
  if (opciones.token !== null)
    cabeceras.authorization = `Bearer ${opciones.token ?? "token-valido"}`;
  return new Request(`http://localhost${ruta}`, {
    method: metodo,
    headers: cabeceras,
    body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
  });
}

export function ctx<P>(params: P): { params: Promise<P> } {
  return { params: Promise.resolve(params) };
}

export function tokenDe(uid: string) {
  return {
    uid,
    email: `${uid}@ejemplo.com`,
    name: `Usuario ${uid}`,
    auth_time: Math.floor(Date.now() / 1000),
  };
}

export function salaDe(cambios: Partial<Sala> = {}): Sala {
  return {
    id: "sala1",
    nombre: "General",
    creadorUid: "u1",
    privada: false,
    miembros: ["u1"],
    creadaEn: "2026-11-14T00:00:00.000Z",
    ...cambios,
  };
}
