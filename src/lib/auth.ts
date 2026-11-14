import type { DecodedIdToken } from "firebase-admin/auth";
import { ErrorApp } from "./errores";
import { getAdminAuth } from "./firebase-admin";

export const NOMBRE_COOKIE = "sesion";

export interface Usuario {
  uid: string;
  correo: string;
  nombre: string;
  rol: string;
}

export function leerCookie(cabecera: string | null, nombre: string): string | null {
  if (!cabecera) return null;
  for (const par of cabecera.split(";")) {
    const [clave, ...resto] = par.trim().split("=");
    if (clave === nombre) return resto.join("=");
  }
  return null;
}

function verificar(request: Request): Promise<DecodedIdToken> {
  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    return getAdminAuth().verifyIdToken(bearer.slice(7), true);
  }
  const cookie = leerCookie(request.headers.get("cookie"), NOMBRE_COOKIE);
  if (cookie) return getAdminAuth().verifySessionCookie(cookie, true);
  throw new ErrorApp(401, "No autenticado");
}

function nombreDe(token: DecodedIdToken): string {
  if (typeof token.name === "string" && token.name) return token.name;
  return (token.email ?? "usuario").split("@")[0] ?? "usuario";
}

/**
 * Verifica la sesión en el servidor (cookie o, para pruebas, Bearer).
 * El uid sale SIEMPRE de aquí, nunca del cuerpo ni de la URL.
 */
export async function requerirUsuario(request: Request): Promise<Usuario> {
  let token: DecodedIdToken;
  try {
    token = await verificar(request);
  } catch (error) {
    if (error instanceof ErrorApp) throw error;
    throw new ErrorApp(401, "Sesión inválida o vencida");
  }
  return {
    uid: token.uid,
    correo: token.email ?? "",
    nombre: nombreDe(token),
    rol: typeof token.rol === "string" ? token.rol : "usuario",
  };
}
