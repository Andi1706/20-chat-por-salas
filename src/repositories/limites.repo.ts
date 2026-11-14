import { getDb } from "@/lib/firebase-admin";

/**
 * Límite de frecuencia compartido entre instancias (Vercel no comparte memoria).
 * Devuelve true si el usuario puede continuar y false si ya hizo una petición dentro de la ventana.
 */
export async function registrarIntento(
  uid: string,
  ahoraMs: number,
  ventanaMs: number,
): Promise<boolean> {
  const db = getDb();
  const referencia = db.collection("limites").doc(uid);
  return db.runTransaction(async (transaccion) => {
    const documento = await transaccion.get(referencia);
    const ultimo: unknown = documento.get("ultimoEn");
    if (typeof ultimo === "number" && ahoraMs - ultimo < ventanaMs) return false;
    transaccion.set(referencia, { ultimoEn: ahoraMs });
    return true;
  });
}
