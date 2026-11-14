import { NOMBRE_COOKIE, leerCookie } from "./auth";
import { ErrorApp } from "./errores";
import { getAdminAuth } from "./firebase-admin";

const CINCO_DIAS_MS = 5 * 24 * 60 * 60 * 1000;
const VENTANA_RECIENTE_S = 5 * 60;
export const MAX_AGE_SEG = CINCO_DIAS_MS / 1000;

/** Cambia un idToken RECIENTE (recién iniciada la sesión) por una cookie de sesión. */
export async function crearCookieSesion(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  let autenticadoEn: number;
  try {
    autenticadoEn = (await auth.verifyIdToken(idToken)).auth_time;
  } catch {
    throw new ErrorApp(401, "Token inválido");
  }
  if (Date.now() / 1000 - autenticadoEn > VENTANA_RECIENTE_S) {
    throw new ErrorApp(401, "Inicia sesión de nuevo");
  }
  return auth.createSessionCookie(idToken, { expiresIn: CINCO_DIAS_MS });
}

export function cabeceraCookie(valor: string, maxAgeSeg: number): string {
  const seguro = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${NOMBRE_COOKIE}=${valor}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeg}${seguro}`;
}

/** Revoca los refresh tokens del usuario si la cookie aún es válida; si no, no pasa nada. */
export async function cerrarSesion(request: Request): Promise<void> {
  const cookie = leerCookie(request.headers.get("cookie"), NOMBRE_COOKIE);
  if (!cookie) return;
  try {
    const auth = getAdminAuth();
    const { uid } = await auth.verifySessionCookie(cookie);
    await auth.revokeRefreshTokens(uid);
  } catch {
    // Cookie vencida o inválida: igual se borra en el navegador.
  }
}
