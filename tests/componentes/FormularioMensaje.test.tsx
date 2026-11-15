// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FormularioMensaje } from "@/components/FormularioMensaje";

function preparar(respuesta: string | null = null) {
  const onEnviar = vi.fn().mockResolvedValue(respuesta);
  render(<FormularioMensaje onEnviar={onEnviar} />);
  return { onEnviar, usuario: userEvent.setup() };
}

describe("FormularioMensaje", () => {
  it("envía con Enter y limpia el campo", async () => {
    const { onEnviar, usuario } = preparar();
    const campo = screen.getByLabelText("Escribe un mensaje");
    await usuario.type(campo, "hola equipo{Enter}");
    expect(onEnviar).toHaveBeenCalledWith("hola equipo");
    expect(campo).toHaveValue("");
  });

  it("Mayús+Enter agrega una línea y no envía", async () => {
    const { onEnviar, usuario } = preparar();
    await usuario.type(
      screen.getByLabelText("Escribe un mensaje"),
      "uno{Shift>}{Enter}{/Shift}dos",
    );
    expect(onEnviar).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Escribe un mensaje")).toHaveValue("uno\ndos");
  });

  it("no envía un mensaje vacío y avisa con role=alert", async () => {
    const { onEnviar, usuario } = preparar();
    await usuario.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onEnviar).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("vacío");
  });

  it("si la API lo rechaza muestra el error y conserva el texto", async () => {
    const { usuario } = preparar("Demasiados mensajes: espera un segundo");
    const campo = screen.getByLabelText("Escribe un mensaje");
    await usuario.type(campo, "hola{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("Demasiados mensajes");
    expect(campo).toHaveValue("hola");
  });
});
