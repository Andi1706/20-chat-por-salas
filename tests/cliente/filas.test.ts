import { describe, expect, it } from "vitest";
import { etiquetaDeDia, prepararFilas } from "@/cliente/filas";
import { iniciales, tonoDe } from "@/cliente/avatar";

// Fechas en hora local para que las pruebas no dependan de la zona horaria de quien las corre.
const AHORA = new Date(2026, 10, 15, 12, 0);
const hoy = new Date(2026, 10, 15, 9, 30).toISOString();
const ayer = new Date(2026, 10, 14, 23, 50).toISOString();

describe("etiquetaDeDia", () => {
  it("dice Hoy y Ayer", () => {
    expect(etiquetaDeDia(hoy, AHORA)).toBe("Hoy");
    expect(etiquetaDeDia(ayer, AHORA)).toBe("Ayer");
  });

  it("escribe la fecha cuando es más antigua", () => {
    expect(etiquetaDeDia(new Date(2026, 9, 3, 10).toISOString(), AHORA)).toContain("octubre");
  });
});

describe("prepararFilas", () => {
  const m = (id: string, uid: string, creadoEn: string) => ({ id, uid, creadoEn });

  it("agrega un separador al cambiar de día", () => {
    const filas = prepararFilas([m("1", "a", ayer), m("2", "a", hoy)], AHORA);
    expect(filas.map((fila) => (fila.tipo === "dia" ? fila.etiqueta : fila.mensaje.id))).toEqual([
      "Ayer",
      "1",
      "Hoy",
      "2",
    ]);
  });

  it("marca como primero solo el inicio de cada racha de la misma persona", () => {
    const filas = prepararFilas([m("1", "a", hoy), m("2", "a", hoy), m("3", "b", hoy)], AHORA);
    const primeros = filas.flatMap((fila) => (fila.tipo === "mensaje" ? [fila.primero] : []));
    expect(primeros).toEqual([true, false, true]);
  });
});

describe("avatar", () => {
  it("toma las iniciales de las dos primeras palabras", () => {
    expect(iniciales("Proyecto 20")).toBe("P2");
    expect(iniciales("ana")).toBe("A");
    expect(iniciales("   ")).toBe("?");
  });

  it("da siempre el mismo tono para el mismo nombre", () => {
    expect(tonoDe("General")).toBe(tonoDe("General"));
    expect(tonoDe("General")).toBeGreaterThanOrEqual(0);
    expect(tonoDe("General")).toBeLessThan(360);
  });
});
