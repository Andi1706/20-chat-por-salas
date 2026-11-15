/** Error de la API tal como lo devuelve el servidor: `{ error, detalles? }`. */
export class ErrorApi extends Error {
  constructor(
    readonly status: number,
    mensaje: string,
    readonly detalles?: { campo: string; mensaje: string }[],
  ) {
    super(mensaje);
    this.name = "ErrorApi";
  }
}

interface Opciones {
  metodo?: "GET" | "POST" | "DELETE";
  cuerpo?: unknown;
  signal?: AbortSignal;
}

async function leerCuerpo(respuesta: Response): Promise<unknown> {
  if (respuesta.status === 204) return null;
  try {
    return await respuesta.json();
  } catch {
    return null;
  }
}

function aError(status: number, cuerpo: unknown): ErrorApi {
  const datos = (cuerpo ?? {}) as { error?: string; detalles?: ErrorApi["detalles"] };
  return new ErrorApi(status, datos.error ?? "Error inesperado", datos.detalles);
}

/**
 * Único punto por donde el navegador habla con nuestra API.
 * La cookie de sesión viaja sola (mismo origen); aquí nunca se guarda ningún token.
 */
export async function pedirApi<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { metodo = "GET", cuerpo, signal } = opciones;
  let respuesta: Response;
  try {
    respuesta = await fetch(ruta, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ErrorApi(0, "No hay conexión con el servidor");
  }
  const datos = await leerCuerpo(respuesta);
  if (!respuesta.ok) throw aError(respuesta.status, datos);
  return datos as T;
}

export function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : "Error inesperado";
}
