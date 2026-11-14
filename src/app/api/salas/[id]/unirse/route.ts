import { requerirUsuario } from "@/lib/auth";
import { json, manejar, validarId, type Ctx } from "@/lib/http";
import { unirse } from "@/services/salas.service";

export const runtime = "nodejs";

export const POST = manejar(async (request, { params }: Ctx<{ id: string }>) => {
  const usuario = await requerirUsuario(request);
  const { id } = await params;
  return json(await unirse(usuario.uid, validarId(id)));
});
