import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const RAIZ_API = join(process.cwd(), "src/app/api");
const METODOS = ["get", "post", "put", "patch", "delete"];

interface Operacion {
  operationId?: string;
  security?: unknown[];
  responses: Record<string, unknown>;
}
type Documento = { paths: Record<string, Record<string, Operacion>> };

const documento = parse(readFileSync(join(process.cwd(), "openapi.yaml"), "utf8")) as Documento;

/** "/api/salas/{id}/mensajes" -> "salas/[id]/mensajes" (carpeta del Route Handler). */
const carpetaDe = (ruta: string) => ruta.replace(/^\/api\//, "").replace(/\{(\w+)\}/g, "[$1]");

function rutasReales(carpeta = RAIZ_API, prefijo = ""): string[] {
  return readdirSync(carpeta).flatMap((nombre) => {
    const completa = join(carpeta, nombre);
    if (statSync(completa).isDirectory()) return rutasReales(completa, `${prefijo}${nombre}/`);
    return nombre === "route.ts" ? [prefijo.replace(/\/$/, "")] : [];
  });
}

function operacionesDelDocumento() {
  return Object.entries(documento.paths).flatMap(([ruta, metodos]) =>
    Object.entries(metodos)
      .filter(([metodo]) => METODOS.includes(metodo))
      .map(([metodo, operacion]) => ({ ruta, metodo, operacion })),
  );
}

describe("openapi.yaml frente al código real", () => {
  it("cada operación documentada existe como Route Handler exportado", () => {
    for (const { ruta, metodo } of operacionesDelDocumento()) {
      const archivo = join(RAIZ_API, carpetaDe(ruta), "route.ts");
      const codigo = readFileSync(archivo, "utf8");
      expect(codigo, `${metodo.toUpperCase()} ${ruta}`).toContain(
        `export const ${metodo.toUpperCase()} =`,
      );
    }
  });

  it("cada Route Handler del proyecto está documentado", () => {
    const documentadas = new Set(Object.keys(documento.paths).map(carpetaDe));
    for (const carpeta of rutasReales()) expect(documentadas, carpeta).toContain(carpeta);
  });

  it("toda operación tiene operationId único", () => {
    const ids = operacionesDelDocumento().map(({ operacion }) => operacion.operationId);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda operación protegida documenta el 401", () => {
    for (const { ruta, metodo, operacion } of operacionesDelDocumento()) {
      if (operacion.security?.length === 0) continue; // crear la sesión es pública
      expect(operacion.responses, `${metodo} ${ruta}`).toHaveProperty("401");
    }
  });
});
