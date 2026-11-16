// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ entrar: vi.fn(), irA: vi.fn() }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("siguiente=/salas/abc"),
}));
vi.mock("@/cliente/navegacion", () => ({ irA: mocks.irA }));
vi.mock("@/cliente/autenticacion", async (original) => ({
  ...(await original<typeof import("@/cliente/autenticacion")>()),
  entrar: mocks.entrar,
}));

import { FormularioLogin } from "@/components/FormularioLogin";

beforeEach(() => vi.resetAllMocks());

describe("FormularioLogin", () => {
  it("valida antes de llamar a Firebase y deja el error junto a su campo", async () => {
    render(<FormularioLogin />);
    await userEvent.type(screen.getByLabelText("Correo"), "no-es-correo");
    await userEvent.type(screen.getByLabelText("Contraseña"), "123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(mocks.entrar).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Correo")).toBeInvalid();
    expect(screen.getByText("Escribe un correo válido")).toBeInTheDocument();
    expect(screen.getByText(/al menos 6 caracteres/)).toBeInTheDocument();
  });

  it("con datos válidos entra y vuelve a la página que se pedía", async () => {
    mocks.entrar.mockResolvedValue(undefined);
    render(<FormularioLogin />);
    await userEvent.type(screen.getByLabelText("Correo"), "ana@ejemplo.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "secreto1");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(mocks.entrar).toHaveBeenCalledWith(
      { correo: "ana@ejemplo.com", clave: "secreto1" },
      false,
    );
    expect(mocks.irA).toHaveBeenCalledWith("/salas/abc");
  });

  it("muestra el error de Firebase con palabras claras", async () => {
    mocks.entrar.mockRejectedValue({ code: "auth/invalid-credential" });
    render(<FormularioLogin />);
    await userEvent.type(screen.getByLabelText("Correo"), "ana@ejemplo.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "secreto1");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");
    expect(mocks.irA).not.toHaveBeenCalled();
  });
});
