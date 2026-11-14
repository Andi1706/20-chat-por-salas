import type { DocumentSnapshot } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import type { Pagina } from "@/schemas/comun";
import { mensajeDocSchema, type Mensaje, type MensajeDoc } from "@/schemas/mensaje";
import { paginar } from "./paginar";

const coleccion = (salaId: string) =>
  getDb().collection("salas").doc(salaId).collection("mensajes");

function aMensaje(documento: DocumentSnapshot): Mensaje {
  return { id: documento.id, ...mensajeDocSchema.parse(documento.data()) };
}

export async function crear(salaId: string, datos: MensajeDoc): Promise<Mensaje> {
  const referencia = await coleccion(salaId).add(datos);
  return { id: referencia.id, ...datos };
}

/** Sondeo corto: mensajes posteriores a `since`, del más viejo al más nuevo. */
export async function listarDesde(
  salaId: string,
  since: string,
  limite: number,
): Promise<Mensaje[]> {
  const { docs } = await coleccion(salaId)
    .where("creadoEn", ">", since)
    .orderBy("creadoEn", "asc")
    .limit(limite)
    .get();
  return docs.map(aMensaje);
}

/** Historial hacia atrás: la página más reciente primero; `siguienteCursor` apunta a lo más viejo. */
export async function listarRecientes(
  salaId: string,
  limite: number,
  cursor?: string,
): Promise<Pagina<Mensaje>> {
  const referencia = coleccion(salaId);
  const pagina = await paginar(
    referencia.orderBy("creadoEn", "desc"),
    referencia,
    limite,
    cursor,
    aMensaje,
  );
  return { ...pagina, items: pagina.items.reverse() };
}

export async function obtener(salaId: string, id: string): Promise<Mensaje | null> {
  const documento = await coleccion(salaId).doc(id).get();
  return documento.exists ? aMensaje(documento) : null;
}

export async function eliminar(salaId: string, id: string): Promise<void> {
  await coleccion(salaId).doc(id).delete();
}
