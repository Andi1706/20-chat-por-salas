const MS_POR_DIA = 86_400_000;

function inicioDeDia(fecha: Date): number {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
}

/** "Hoy", "Ayer" o la fecha escrita: separa los mensajes por día como hacen los chats. */
export function etiquetaDeDia(iso: string, ahora: Date = new Date()): string {
  const fecha = new Date(iso);
  const dias = Math.round((inicioDeDia(ahora) - inicioDeDia(fecha)) / MS_POR_DIA);
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Ayer";
  const mismoAnio = fecha.getFullYear() === ahora.getFullYear();
  return fecha.toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: mismoAnio ? undefined : "numeric",
  });
}

interface ConAutor {
  id: string;
  uid: string;
  creadoEn: string;
}

export type Fila<T extends ConAutor> =
  { tipo: "dia"; etiqueta: string } | { tipo: "mensaje"; mensaje: T; primero: boolean };

/**
 * Convierte la lista de mensajes en filas para dibujar: un separador al cambiar de día y
 * `primero` en el primer mensaje de cada racha de la misma persona (solo ahí se muestra el nombre).
 */
export function prepararFilas<T extends ConAutor>(
  mensajes: T[],
  ahora: Date = new Date(),
): Fila<T>[] {
  const filas: Fila<T>[] = [];
  let dia = "";
  let autor = "";
  for (const mensaje of mensajes) {
    const etiqueta = etiquetaDeDia(mensaje.creadoEn, ahora);
    const cambioDeDia = etiqueta !== dia;
    if (cambioDeDia) filas.push({ tipo: "dia", etiqueta });
    filas.push({ tipo: "mensaje", mensaje, primero: cambioDeDia || mensaje.uid !== autor });
    dia = etiqueta;
    autor = mensaje.uid;
  }
  return filas;
}
