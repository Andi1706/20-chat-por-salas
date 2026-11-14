import { ErrorApp } from "@/lib/errores";
import * as salasRepo from "@/repositories/salas.repo";
import type { Pagina } from "@/schemas/comun";
import type { ConsultaSalas, Sala, SalaNueva } from "@/schemas/sala";

export function crearSala(uid: string, datos: SalaNueva, ahora: Date = new Date()): Promise<Sala> {
  return salasRepo.crear({
    nombre: datos.nombre,
    creadorUid: uid,
    privada: datos.privada,
    miembros: [uid],
    creadaEn: ahora.toISOString(),
  });
}

export function listarSalas(uid: string, consulta: ConsultaSalas): Promise<Pagina<Sala>> {
  if (consulta.mias) return salasRepo.listarDeMiembro(uid, consulta.limite, consulta.cursor);
  return salasRepo.listarPublicas(consulta.limite, consulta.cursor);
}

/** 404 si no existe; 403 si es privada y el usuario no es miembro. */
export async function obtenerSalaVisible(uid: string, id: string): Promise<Sala> {
  const sala = await salasRepo.obtener(id);
  if (!sala) throw new ErrorApp(404, "La sala no existe");
  if (sala.privada && !sala.miembros.includes(uid)) {
    throw new ErrorApp(403, "No eres miembro de esta sala");
  }
  return sala;
}

export async function unirse(uid: string, id: string): Promise<Sala> {
  const sala = await obtenerSalaVisible(uid, id);
  if (sala.miembros.includes(uid)) return sala;
  await salasRepo.agregarMiembro(id, uid);
  return { ...sala, miembros: [...sala.miembros, uid] };
}
