import type {
  CollectionReference,
  DocumentSnapshot,
  Query,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { ErrorApp } from "@/lib/errores";
import type { Pagina } from "@/schemas/comun";

async function documentoCursor(
  coleccion: CollectionReference,
  cursor: string,
): Promise<DocumentSnapshot> {
  const documento = await coleccion.doc(cursor).get();
  if (!documento.exists) throw new ErrorApp(400, "Cursor inválido");
  return documento;
}

/** Paginación por cursor (el id del último documento). Pide uno de más para saber si hay otra página. */
export async function paginar<T>(
  consulta: Query,
  coleccion: CollectionReference,
  limite: number,
  cursor: string | undefined,
  mapear: (documento: QueryDocumentSnapshot) => T,
): Promise<Pagina<T>> {
  let q = consulta.limit(limite + 1);
  if (cursor) q = q.startAfter(await documentoCursor(coleccion, cursor));
  const { docs } = await q.get();
  const ultimo = docs[limite - 1];
  return {
    items: docs.slice(0, limite).map(mapear),
    siguienteCursor: docs.length > limite && ultimo ? ultimo.id : null,
  };
}
