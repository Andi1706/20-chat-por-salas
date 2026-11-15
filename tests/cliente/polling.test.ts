import { describe, expect, it } from "vitest";
import {
  DESDE_EL_PRINCIPIO,
  ESPERA_MAXIMA_MS,
  calcularEspera,
  combinarMensajes,
  marcaDeSondeo,
} from "@/cliente/polling";
import { mensaje } from "../cliente-helpers";

describe("calcularEspera (retroceso exponencial)", () => {
  it("espera 2 s con la pestaña visible y sin fallos", () => {
    expect(calcularEspera(0, true)).toBe(2000);
  });

  it("espera menos de 5 s con la pestaña oculta, para poder avisar a tiempo", () => {
    expect(calcularEspera(0, false)).toBeLessThan(5000);
  });

  it("duplica la espera con cada fallo seguido", () => {
    expect([0, 1, 2, 3].map((fallos) => calcularEspera(fallos, true))).toEqual([
      2000, 4000, 8000, 16000,
    ]);
  });

  it("nunca pasa del máximo", () => {
    expect(calcularEspera(20, true)).toBe(ESPERA_MAXIMA_MS);
  });
});

describe("combinarMensajes", () => {
  it("no repite mensajes con el mismo id y los deja en orden cronológico", () => {
    const a = mensaje("a", "2026-11-14T10:00:00.000Z");
    const b = mensaje("b", "2026-11-14T10:00:05.000Z");
    expect(combinarMensajes([b], [a, b])).toEqual([a, b]);
  });

  it("desempata por id cuando la fecha es igual", () => {
    const x = mensaje("x", "2026-11-14T10:00:00.000Z");
    const y = mensaje("y", "2026-11-14T10:00:00.000Z");
    expect(combinarMensajes([y], [x])).toEqual([x, y]);
  });
});

describe("marcaDeSondeo", () => {
  it("usa la fecha del último mensaje menos 1 s (solape)", () => {
    const marca = marcaDeSondeo([mensaje("a", "2026-11-14T10:00:05.000Z")]);
    expect(marca).toBe("2026-11-14T10:00:04.000Z");
  });

  it("sin mensajes empieza desde el principio", () => {
    expect(marcaDeSondeo([])).toBe(DESDE_EL_PRINCIPIO);
  });
});
