import { requerirUsuario } from "@/lib/auth";
import { json, manejar } from "@/lib/http";

export const runtime = "nodejs";

export const GET = manejar(async (request) => {
  const { uid, correo, rol } = await requerirUsuario(request);
  return json({ usuario: { uid, correo, rol } });
});
