import { FieldValue, type DocumentSnapshot } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import type { Pagina } from "@/schemas/comun";
import { salaDocSchema, type Sala, type SalaDoc } from "@/schemas/sala";
import { paginar } from "./paginar";

const coleccion = () => getDb().collection("salas");

function aSala(documento: DocumentSnapshot): Sala {
  return { id: documento.id, ...salaDocSchema.parse(documento.data()) };
}

export async function crear(datos: SalaDoc): Promise<Sala> {
  const referencia = await coleccion().add(datos);
  return { id: referencia.id, ...datos };
}

export async function obtener(id: string): Promise<Sala | null> {
  const documento = await coleccion().doc(id).get();
  return documento.exists ? aSala(documento) : null;
}

export function listarPublicas(limite: number, cursor?: string): Promise<Pagina<Sala>> {
  const consulta = coleccion().where("privada", "==", false).orderBy("creadaEn", "desc");
  return paginar(consulta, coleccion(), limite, cursor, aSala);
}

export function listarDeMiembro(
  uid: string,
  limite: number,
  cursor?: string,
): Promise<Pagina<Sala>> {
  const consulta = coleccion().where("miembros", "array-contains", uid).orderBy("creadaEn", "desc");
  return paginar(consulta, coleccion(), limite, cursor, aSala);
}

export async function agregarMiembro(id: string, uid: string): Promise<void> {
  await coleccion()
    .doc(id)
    .update({ miembros: FieldValue.arrayUnion(uid) });
}
