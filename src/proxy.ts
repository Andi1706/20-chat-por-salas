import { NextResponse, type NextRequest } from "next/server";

/**
 * Comodidad, NO seguridad: si no hay cookie de sesión, manda a /login en vez de mostrar una pantalla vacía.
 * La seguridad real está en la API, que verifica la cookie en cada petición (src/lib/auth.ts).
 * "sesion" debe coincidir con NOMBRE_COOKIE de src/lib/auth.ts.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has("sesion")) return NextResponse.next();
  const destino = new URL("/login", request.url);
  destino.searchParams.set("siguiente", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(destino);
}

export const config = { matcher: ["/salas/:path*", "/perfil"] };
