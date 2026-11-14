import { requerirUsuario } from "@/lib/auth";
import { json, manejar, validarId, type Ctx } from "@/lib/http";
import { obtenerSalaVisible } from "@/services/salas.service";

export const runtime = "nodejs";

export const GET = manejar(async (request, { params }: Ctx<{ id: string }>) => {
  const usuario = await requerirUsuario(request);
  const { id } = await params;
  return json(await obtenerSalaVisible(usuario.uid, validarId(id)));
});
