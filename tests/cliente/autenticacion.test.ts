import { describe, expect, it } from "vitest";
import { destinoSeguro } from "@/cliente/autenticacion";

describe("destinoSeguro (evita redirecciones abiertas)", () => {
  it("acepta rutas internas", () => {
    expect(destinoSeguro("/salas/abc")).toBe("/salas/abc");
  });

  it.each([null, "", "https://malo.com", "//malo.com", "/\\malo.com", "javascript:alert(1)"])(
    "rechaza %j y usa /salas",
    (valor) => {
      expect(destinoSeguro(valor)).toBe("/salas");
    },
  );
});
