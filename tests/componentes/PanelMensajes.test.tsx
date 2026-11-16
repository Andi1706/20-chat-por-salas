// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ useMensajes: vi.fn() }));

vi.mock("@/hooks/useMensajes", () => ({ useMensajes: mocks.useMensajes }));
vi.mock("@/hooks/useAvisos", () => ({ useAvisos: vi.fn() }));

import { PanelMensajes } from "@/components/PanelMensajes";

const sala = {
  id: "s1",
  nombre: "General",
  privada: false,
  creadorUid: "u1",
  miembros: ["u1"],
  creadoEn: "2026-05-01T10:00:00.000Z",
};
const usuario = { uid: "u1", correo: "a@b.co", nombre: "Ana", rol: "usuario" as const };

function datos(extra: object) {
  return {
    estado: "listo",
    error: null,
    mensajes: [],
    hayMas: false,
    cargandoMas: false,
    reconectando: false,
    enviar: vi.fn(),
    eliminar: vi.fn(),
    verAnteriores: vi.fn(),
    ...extra,
  };
}

beforeEach(() => vi.resetAllMocks());

describe("PanelMensajes", () => {
  it("muestra «Reconectando…» cuando falla el sondeo", () => {
    mocks.useMensajes.mockReturnValue(datos({ reconectando: true }));
    render(<PanelMensajes sala={sala as never} usuario={usuario as never} puedeEscribir />);
    expect(screen.getByRole("status")).toHaveTextContent("Reconectando…");
  });

  it("no muestra el aviso si la conexión está bien", () => {
    mocks.useMensajes.mockReturnValue(datos({}));
    render(<PanelMensajes sala={sala as never} usuario={usuario as never} puedeEscribir />);
    expect(screen.queryByText("Reconectando…")).not.toBeInTheDocument();
  });

  it("muestra el esqueleto mientras carga", () => {
    mocks.useMensajes.mockReturnValue(datos({ estado: "cargando" }));
    render(<PanelMensajes sala={sala as never} usuario={usuario as never} puedeEscribir />);
    expect(screen.getByText("Cargando mensajes…")).toBeInTheDocument();
  });
});
