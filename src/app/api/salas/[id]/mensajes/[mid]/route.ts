import { requerirUsuario } from "@/lib/auth";
import { manejar, sinContenido, validarId, type Ctx } from "@/lib/http";
import { eliminarMensaje } from "@/services/mensajes.service";

export const runtime = "nodejs";

export const DELETE = manejar(async (request, { params }: Ctx<{ id: string; mid: string }>) => {
  const usuario = await requerirUsuario(request);
  const { id, mid } = await params;
  await eliminarMensaje(usuario.uid, validarId(id), validarId(mid));
  return sinContenido();
});
