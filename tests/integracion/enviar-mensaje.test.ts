import { beforeEach, describe, expect, it, vi } from "vitest";
import { ctx, pedir, salaDe, tokenDe } from "../helpers";

const mocks = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminAuth: () => ({ verifyIdToken: mocks.verifyIdToken }),
  getDb: vi.fn(),
}));
vi.mock("@/repositories/salas.repo", () => ({ obtener: vi.fn() }));
vi.mock("@/repositories/mensajes.repo", () => ({ crear: vi.fn() }));
vi.mock("@/repositories/limites.repo", () => ({ registrarIntento: vi.fn() }));

import { POST } from "@/app/api/salas/[id]/mensajes/route";
import * as limitesRepo from "@/repositories/limites.repo";
import * as mensajesRepo from "@/repositories/mensajes.repo";
import * as salasRepo from "@/repositories/salas.repo";

const PARAMS = ctx({ id: "sala1" });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verifyIdToken.mockResolvedValue(tokenDe("u1"));
  vi.mocked(limitesRepo.registrarIntento).mockResolvedValue(true);
});

describe("ruta -> servicio -> repositorio al enviar un mensaje", () => {
  it("ignora un uid falso del cuerpo: se rechaza con 400 y no se guarda nada", async () => {
    vi.mocked(salasRepo.obtener).mockResolvedValue(salaDe());
    const cuerpo = { texto: "hola", uid: "otra-persona" };
    const respuesta = await POST(pedir("POST", "/api/salas/sala1/mensajes", { cuerpo }), PARAMS);
    expect(respuesta.status).toBe(400);
    expect(mensajesRepo.crear).not.toHaveBeenCalled();
  });

  it("exige ser miembro: un usuario que no se unió recibe 403 y no se guarda nada", async () => {
    vi.mocked(salasRepo.obtener).mockResolvedValue(salaDe({ miembros: ["otro"] }));
    const cuerpo = { texto: "hola" };
    const respuesta = await POST(pedir("POST", "/api/salas/sala1/mensajes", { cuerpo }), PARAMS);
    expect(respuesta.status).toBe(403);
    expect(mensajesRepo.crear).not.toHaveBeenCalled();
  });
});
