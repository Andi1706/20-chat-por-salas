import { beforeEach, describe, expect, it, vi } from "vitest";
import { salaDe } from "../helpers";

vi.mock("@/lib/firebase-admin", () => ({ getAdminAuth: vi.fn(), getDb: vi.fn() }));
vi.mock("@/repositories/salas.repo", () => ({
  crear: vi.fn(),
  obtener: vi.fn(),
  listarPublicas: vi.fn(),
  listarDeMiembro: vi.fn(),
  agregarMiembro: vi.fn(),
}));

import * as salasRepo from "@/repositories/salas.repo";
import { crearSala, listarSalas, unirse } from "@/services/salas.service";

beforeEach(() => vi.resetAllMocks());

describe("crearSala", () => {
  it("agrega al creador como primer miembro", async () => {
    vi.mocked(salasRepo.crear).mockResolvedValue(salaDe());
    await crearSala("u1", { nombre: "General", privada: false }, new Date("2026-11-14T00:00:00Z"));
    expect(salasRepo.crear).toHaveBeenCalledWith({
      nombre: "General",
      creadorUid: "u1",
      privada: false,
      miembros: ["u1"],
      creadaEn: "2026-11-14T00:00:00.000Z",
    });
  });
});

describe("listarSalas", () => {
  it("lista las públicas por defecto", async () => {
    vi.mocked(salasRepo.listarPublicas).mockResolvedValue({ items: [], siguienteCursor: null });
    await listarSalas("u1", { limite: 20, mias: false, cursor: undefined });
    expect(salasRepo.listarPublicas).toHaveBeenCalledWith(20, undefined);
  });

  it("lista solo las del usuario cuando mias es true", async () => {
    vi.mocked(salasRepo.listarDeMiembro).mockResolvedValue({ items: [], siguienteCursor: null });
    await listarSalas("u1", { limite: 10, mias: true, cursor: "abc" });
    expect(salasRepo.listarDeMiembro).toHaveBeenCalledWith("u1", 10, "abc");
  });
});

describe("unirse", () => {
  it("agrega al usuario a una sala pública", async () => {
    vi.mocked(salasRepo.obtener).mockResolvedValue(salaDe());
    const sala = await unirse("u2", "sala1");
    expect(salasRepo.agregarMiembro).toHaveBeenCalledWith("sala1", "u2");
    expect(sala.miembros).toEqual(["u1", "u2"]);
  });

  it("no repite a quien ya es miembro", async () => {
    vi.mocked(salasRepo.obtener).mockResolvedValue(salaDe());
    await unirse("u1", "sala1");
    expect(salasRepo.agregarMiembro).not.toHaveBeenCalled();
  });

  it("no deja unirse a una sala privada sin invitación (403)", async () => {
    vi.mocked(salasRepo.obtener).mockResolvedValue(salaDe({ privada: true }));
    await expect(unirse("u2", "sala1")).rejects.toMatchObject({ status: 403 });
  });
});
