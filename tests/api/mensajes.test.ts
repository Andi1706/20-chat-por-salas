import { beforeEach, describe, expect, it, vi } from "vitest";
import { ctx, pedir, salaDe, tokenDe } from "../helpers";

const mocks = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminAuth: () => ({ verifyIdToken: mocks.verifyIdToken }),
  getDb: vi.fn(),
}));
vi.mock("@/repositories/salas.repo", () => ({ obtener: vi.fn() }));
vi.mock("@/repositories/mensajes.repo", () => ({
  crear: vi.fn(),
  listarRecientes: vi.fn(),
  listarDesde: vi.fn(),
  obtener: vi.fn(),
  eliminar: vi.fn(),
}));
vi.mock("@/repositories/limites.repo", () => ({ registrarIntento: vi.fn() }));

import { GET, POST } from "@/app/api/salas/[id]/mensajes/route";
import { DELETE } from "@/app/api/salas/[id]/mensajes/[mid]/route";
import * as limitesRepo from "@/repositories/limites.repo";
import * as mensajesRepo from "@/repositories/mensajes.repo";
import * as salasRepo from "@/repositories/salas.repo";

const RUTA = "/api/salas/sala1/mensajes";
const PARAMS = ctx({ id: "sala1" });
const mensaje = {
  id: "m1",
  uid: "u1",
  nombre: "Usuario u1",
  texto: "hola",
  creadoEn: "2026-11-14T12:00:00.000Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verifyIdToken.mockResolvedValue(tokenDe("u1"));
  vi.mocked(salasRepo.obtener).mockResolvedValue(salaDe());
});

describe("autenticación", () => {
  it("responde 401 si no hay sesión", async () => {
    const respuesta = await GET(pedir("GET", RUTA, { token: null }), PARAMS);
    expect(respuesta.status).toBe(401);
    expect(await respuesta.json()).toEqual({ error: "No autenticado" });
  });

  it("responde 401 si el token es inválido", async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error("token malo"));
    const respuesta = await GET(pedir("GET", RUTA), PARAMS);
    expect(respuesta.status).toBe(401);
  });
});

describe("validación", () => {
  it("responde 400 con detalle por campo si el texto está vacío", async () => {
    const respuesta = await POST(pedir("POST", RUTA, { cuerpo: { texto: "   " } }), PARAMS);
    expect(respuesta.status).toBe(400);
    const cuerpo = await respuesta.json();
    expect(cuerpo.detalles[0].campo).toBe("texto");
  });

  it("responde 400 si el texto pasa de 500 caracteres", async () => {
    const respuesta = await POST(
      pedir("POST", RUTA, { cuerpo: { texto: "a".repeat(501) } }),
      PARAMS,
    );
    expect(respuesta.status).toBe(400);
  });

  it("responde 400 si el parámetro since no es una fecha ISO", async () => {
    const respuesta = await GET(pedir("GET", `${RUTA}?since=ayer`), PARAMS);
    expect(respuesta.status).toBe(400);
  });
});

describe("autorización", () => {
  it("responde 403 al leer una sala privada sin ser miembro", async () => {
    vi.mocked(salasRepo.obtener).mockResolvedValue(salaDe({ privada: true, miembros: ["otro"] }));
    const respuesta = await GET(pedir("GET", RUTA), PARAMS);
    expect(respuesta.status).toBe(403);
  });

  it("responde 404 si la sala no existe", async () => {
    vi.mocked(salasRepo.obtener).mockResolvedValue(null);
    const respuesta = await GET(pedir("GET", RUTA), PARAMS);
    expect(respuesta.status).toBe(404);
  });

  it("responde 403 al eliminar un mensaje si no eres el creador de la sala", async () => {
    vi.mocked(salasRepo.obtener).mockResolvedValue(
      salaDe({ creadorUid: "otro", miembros: ["u1", "otro"] }),
    );
    const respuesta = await DELETE(pedir("DELETE", `${RUTA}/m1`), ctx({ id: "sala1", mid: "m1" }));
    expect(respuesta.status).toBe(403);
    expect(mensajesRepo.eliminar).not.toHaveBeenCalled();
  });
});

describe("casos exitosos", () => {
  it("crea un mensaje (201) con el autor tomado de la sesión", async () => {
    vi.mocked(limitesRepo.registrarIntento).mockResolvedValue(true);
    vi.mocked(mensajesRepo.crear).mockResolvedValue(mensaje);
    const respuesta = await POST(pedir("POST", RUTA, { cuerpo: { texto: " hola " } }), PARAMS);
    expect(respuesta.status).toBe(201);
    expect(mensajesRepo.crear).toHaveBeenCalledWith(
      "sala1",
      expect.objectContaining({ uid: "u1", texto: "hola" }),
    );
  });

  it("el sondeo con since devuelve solo los mensajes nuevos", async () => {
    vi.mocked(mensajesRepo.listarDesde).mockResolvedValue([mensaje]);
    const since = "2026-11-14T11:59:00.000Z";
    const respuesta = await GET(pedir("GET", `${RUTA}?since=${since}`), PARAMS);
    expect(respuesta.status).toBe(200);
    expect(mensajesRepo.listarDesde).toHaveBeenCalledWith("sala1", since, 100);
  });

  it("el creador de la sala elimina un mensaje (204)", async () => {
    vi.mocked(mensajesRepo.obtener).mockResolvedValue(mensaje);
    const respuesta = await DELETE(pedir("DELETE", `${RUTA}/m1`), ctx({ id: "sala1", mid: "m1" }));
    expect(respuesta.status).toBe(204);
    expect(mensajesRepo.eliminar).toHaveBeenCalledWith("sala1", "m1");
  });
});

describe("límite de frecuencia", () => {
  it("el sexto mensaje dentro de un segundo recibe 429", async () => {
    let intentos = 0;
    vi.mocked(limitesRepo.registrarIntento).mockImplementation(async () => ++intentos === 1);
    vi.mocked(mensajesRepo.crear).mockResolvedValue(mensaje);
    const estados: number[] = [];
    for (let i = 0; i < 6; i++) {
      const respuesta = await POST(pedir("POST", RUTA, { cuerpo: { texto: "hola" } }), PARAMS);
      estados.push(respuesta.status);
    }
    expect(estados).toEqual([201, 429, 429, 429, 429, 429]);
  });
});
