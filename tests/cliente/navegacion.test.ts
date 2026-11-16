// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { irA } from "@/cliente/navegacion";

describe("irA", () => {
  it("pide la página al servidor con una navegación completa", () => {
    const asignar = vi.fn();
    vi.stubGlobal("location", { assign: asignar });
    irA("/salas");
    expect(asignar).toHaveBeenCalledWith("/salas");
    vi.unstubAllGlobals();
  });
});
