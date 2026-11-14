import { requerirUsuario } from "@/lib/auth";
import { json, leerJson, manejar, parametrosDe, validar } from "@/lib/http";
import { consultaSalasSchema, salaNuevaSchema } from "@/schemas/sala";
import { crearSala, listarSalas } from "@/services/salas.service";

export const runtime = "nodejs";

export const GET = manejar(async (request) => {
  const usuario = await requerirUsuario(request);
  const consulta = validar(consultaSalasSchema, parametrosDe(request));
  return json(await listarSalas(usuario.uid, consulta));
});

export const POST = manejar(async (request) => {
  const usuario = await requerirUsuario(request);
  const datos = await leerJson(request, salaNuevaSchema);
  return json(await crearSala(usuario.uid, datos), 201);
});
