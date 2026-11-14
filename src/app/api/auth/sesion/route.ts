import { leerJson, manejar, sinContenido } from "@/lib/http";
import { MAX_AGE_SEG, cabeceraCookie, cerrarSesion, crearCookieSesion } from "@/lib/sesion";
import { sesionSchema } from "@/schemas/sesion";

export const runtime = "nodejs";

export const POST = manejar(async (request) => {
  const { idToken } = await leerJson(request, sesionSchema);
  const cookie = await crearCookieSesion(idToken);
  return sinContenido({ "Set-Cookie": cabeceraCookie(cookie, MAX_AGE_SEG) });
});

export const DELETE = manejar(async (request) => {
  await cerrarSesion(request);
  return sinContenido({ "Set-Cookie": cabeceraCookie("", 0) });
});
