import { requerirUsuario } from "@/lib/auth";
import { json, manejar } from "@/lib/http";

export const runtime = "nodejs";

/** Devuelve quién es el usuario de la sesión. La interfaz lo usa para saber qué mensajes son suyos. */
export const GET = manejar(async (request) => {
  const { uid, correo, nombre, rol } = await requerirUsuario(request);
  return json({ usuario: { uid, correo, nombre, rol } });
});
