import type { ZodType } from "zod";
import { ErrorApp, detallesDeZod } from "./errores";
import { registrar } from "./log";

export interface Ctx<P> {
  params: Promise<P>;
}

const METODOS_SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);
const FORMATO_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function json(
  datos: unknown,
  status = 200,
  cabeceras: Record<string, string> = {},
): Response {
  return Response.json(datos, { status, headers: { "Cache-Control": "no-store", ...cabeceras } });
}

export function sinContenido(cabeceras: Record<string, string> = {}): Response {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store", ...cabeceras },
  });
}

/** Defensa CSRF: en peticiones que modifican datos, Origin debe coincidir con el sitio. */
export function comprobarOrigen(request: Request): void {
  if (METODOS_SEGUROS.has(request.method)) return;
  const origen = request.headers.get("origin");
  if (origen === null) {
    // Sin Origin solo se acepta si trae Authorization (Bruno, Postman); un formulario ajeno no puede enviarlo.
    if (request.headers.has("authorization")) return;
    throw new ErrorApp(403, "Falta la cabecera Origin");
  }
  if (origen !== new URL(request.url).origin) throw new ErrorApp(403, "Origen no permitido");
}

export function validar<T>(esquema: ZodType<T>, datos: unknown): T {
  const resultado = esquema.safeParse(datos);
  if (!resultado.success) {
    throw new ErrorApp(400, "Datos inválidos", detallesDeZod(resultado.error));
  }
  return resultado.data;
}

export async function leerJson<T>(request: Request, esquema: ZodType<T>): Promise<T> {
  const tipo = request.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    throw new ErrorApp(415, "El Content-Type debe ser application/json");
  }
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    throw new ErrorApp(400, "El cuerpo no es un JSON válido");
  }
  return validar(esquema, cuerpo);
}

export function parametrosDe(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams);
}

export function validarId(valor: string): string {
  if (!FORMATO_ID.test(valor)) throw new ErrorApp(400, "Identificador inválido");
  return valor;
}

export function respuestaDeError(error: unknown): Response {
  if (error instanceof ErrorApp) {
    const cuerpo = error.detalles
      ? { error: error.message, detalles: error.detalles }
      : { error: error.message };
    return json(cuerpo, error.status);
  }
  registrar({ nivel: "error", tipo: error instanceof Error ? error.name : "desconocido" });
  return json({ error: "Error interno del servidor" }, 500);
}

type Manejador<P> = (request: Request, ctx: Ctx<P>) => Promise<Response>;

async function ejecutar<P>(
  manejador: Manejador<P>,
  request: Request,
  ctx: Ctx<P>,
): Promise<Response> {
  try {
    comprobarOrigen(request);
    return await manejador(request, ctx);
  } catch (error) {
    return respuestaDeError(error);
  }
}

/** Envoltorio común: convierte cualquier error en una respuesta consistente y registra la petición. */
export function manejar<P>(manejador: Manejador<P>) {
  return async (request: Request, ctx: Ctx<P>): Promise<Response> => {
    const id = crypto.randomUUID();
    const respuesta = await ejecutar(manejador, request, ctx);
    respuesta.headers.set("x-request-id", id);
    registrar({
      id,
      metodo: request.method,
      ruta: new URL(request.url).pathname,
      status: respuesta.status,
    });
    return respuesta;
  };
}
