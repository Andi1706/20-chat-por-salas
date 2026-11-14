import { requerirUsuario } from "@/lib/auth";
import { json, leerJson, manejar, parametrosDe, validar, validarId, type Ctx } from "@/lib/http";
import { consultaMensajesSchema, mensajeNuevoSchema } from "@/schemas/mensaje";
import { enviarMensaje, listarMensajes } from "@/services/mensajes.service";

export const runtime = "nodejs";

/** Sondeo corto (`?since=`) o historial hacia atrás (`?limite=&cursor=`). */
export const GET = manejar(async (request, { params }: Ctx<{ id: string }>) => {
  const usuario = await requerirUsuario(request);
  const { id } = await params;
  const consulta = validar(consultaMensajesSchema, parametrosDe(request));
  return json(await listarMensajes(usuario.uid, validarId(id), consulta));
});

export const POST = manejar(async (request, { params }: Ctx<{ id: string }>) => {
  const usuario = await requerirUsuario(request);
  const { id } = await params;
  const datos = await leerJson(request, mensajeNuevoSchema);
  return json(await enviarMensaje(usuario, validarId(id), datos), 201);
});
