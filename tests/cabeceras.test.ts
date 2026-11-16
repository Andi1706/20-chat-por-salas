import { describe, expect, it } from "vitest";
import { cabecerasDeSeguridad, construirCsp } from "@/lib/cabeceras";

function valor(desarrollo: boolean, nombre: string) {
  return cabecerasDeSeguridad(desarrollo).find((c) => c.key === nombre)?.value;
}

describe("cabeceras de seguridad", () => {
  it("incluye las cabeceras básicas", () => {
    expect(valor(false, "X-Content-Type-Options")).toBe("nosniff");
    expect(valor(false, "X-Frame-Options")).toBe("DENY");
    expect(valor(false, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("la CSP de producción no permite eval ni embeber el sitio en otro", () => {
    const csp = construirCsp(false);
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("default-src 'self'");
  });

  it("deja conectar solo con el sitio y con Firebase Auth", () => {
    const conexion = construirCsp(false)
      .split("; ")
      .find((regla) => regla.startsWith("connect-src"));
    expect(conexion).toContain("https://identitytoolkit.googleapis.com");
    expect(conexion).not.toContain("*");
  });

  it("en desarrollo permite eval (lo necesita React) y websocket", () => {
    const csp = construirCsp(true);
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("ws:");
  });
});
