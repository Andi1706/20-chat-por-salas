import type { Usuario } from "@/lib/auth";
import { ErrorApp } from "@/lib/errores";
import * as limitesRepo from "@/repositories/limites.repo";
import * as mensajesRepo from "@/repositories/mensajes.repo";
import type { Pagina } from "@/schemas/comun";
import type { ConsultaMensajes, Mensaje, MensajeNuevo } from "@/schemas/mensaje";
import { obtenerSalaVisible } from "./salas.service";

const VENTANA_MS = 1000;
const MAXIMO_SONDEO = 100;

export async function listarMensajes(
  uid: string,
  salaId: string,
  consulta: ConsultaMensajes,
): Promise<Pagina<Mensaje>> {
  await obtenerSalaVisible(uid, salaId);
  if (consulta.since) {
    const items = await mensajesRepo.listarDesde(salaId, consulta.since, MAXIMO_SONDEO);
    return { items, siguienteCursor: null };
  }
  return mensajesRepo.listarRecientes(salaId, consulta.limite, consulta.cursor);
}

export async function enviarMensaje(
  usuario: Usuario,
  salaId: string,
  datos: MensajeNuevo,
  ahoraMs: number = Date.now(),
): Promise<Mensaje> {
  const sala = await obtenerSalaVisible(usuario.uid, salaId);
  if (!sala.miembros.includes(usuario.uid)) {
    throw new ErrorApp(403, "Únete a la sala para escribir");
  }
  const permitido = await limitesRepo.registrarIntento(usuario.uid, ahoraMs, VENTANA_MS);
  if (!permitido) throw new ErrorApp(429, "Demasiados mensajes: espera un segundo");
  return mensajesRepo.crear(salaId, {
    uid: usuario.uid,
    nombre: usuario.nombre,
    texto: datos.texto,
    creadoEn: new Date(ahoraMs).toISOString(),
  });
}

/** Moderación: solo el creador de la sala elimina mensajes. */
export async function eliminarMensaje(
  uid: string,
  salaId: string,
  mensajeId: string,
): Promise<void> {
  const sala = await obtenerSalaVisible(uid, salaId);
  if (sala.creadorUid !== uid) throw new ErrorApp(403, "Solo el creador de la sala puede moderar");
  const mensaje = await mensajesRepo.obtener(salaId, mensajeId);
  if (!mensaje) throw new ErrorApp(404, "El mensaje no existe");
  await mensajesRepo.eliminar(salaId, mensajeId);
}
