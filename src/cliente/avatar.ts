/** Iniciales para el círculo de una sala o persona: "Proyecto 20" -> "P2", "ana" -> "A". */
export function iniciales(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const letras = palabras.map((palabra) => Array.from(palabra)[0] ?? "").join("");
  return (letras || "?").toUpperCase();
}

/** Tono (0 a 359) siempre igual para el mismo nombre; el CSS lo convierte en un color con buen contraste. */
export function tonoDe(nombre: string): number {
  let suma = 0;
  for (const letra of nombre) suma = (suma * 31 + (letra.codePointAt(0) ?? 0)) % 360;
  return suma;
}
