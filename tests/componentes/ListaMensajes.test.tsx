// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListaMensajes } from "@/components/ListaMensajes";
import { mensaje } from "../cliente-helpers";

const propios = {
  uidPropio: "u1",
  hayMas: false,
  cargandoMas: false,
  onVerAnteriores: vi.fn(),
};

describe("ListaMensajes", () => {
  it("es un registro accesible que anuncia los mensajes nuevos con cortesía", () => {
    render(<ListaMensajes {...propios} mensajes={[]} puedeModerar={false} onEliminar={vi.fn()} />);
    const registro = screen.getByRole("log", { name: "Mensajes de la sala" });
    expect(registro).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText(/Aún no hay mensajes/)).toBeInTheDocument();
  });

  it("distingue los mensajes propios de los ajenos", () => {
    const mensajes = [
      mensaje("a", "2026-11-14T10:00:00.000Z", { uid: "u1", nombre: "Yo" }),
      mensaje("b", "2026-11-14T10:00:05.000Z", { nombre: "Ana" }),
    ];
    render(
      <ListaMensajes {...propios} mensajes={mensajes} puedeModerar={false} onEliminar={vi.fn()} />,
    );
    expect(screen.getByText("Tú:")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });

  it("solo ofrece eliminar al moderador y avisa qué mensaje se elimina", async () => {
    const onEliminar = vi.fn();
    const mensajes = [mensaje("b", "2026-11-14T10:00:05.000Z", { nombre: "Ana" })];
    const { rerender } = render(
      <ListaMensajes
        {...propios}
        mensajes={mensajes}
        puedeModerar={false}
        onEliminar={onEliminar}
      />,
    );
    expect(screen.queryByRole("button", { name: /Eliminar/ })).not.toBeInTheDocument();

    rerender(
      <ListaMensajes {...propios} mensajes={mensajes} puedeModerar onEliminar={onEliminar} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Eliminar el mensaje de Ana" }));
    expect(onEliminar).toHaveBeenCalledWith("b");
  });

  it("muestra el texto como texto, sin interpretar HTML", () => {
    const peligroso = mensaje("c", "2026-11-14T10:00:00.000Z", {
      texto: "<img src=x onerror=alert(1)>",
    });
    const { container } = render(
      <ListaMensajes
        {...propios}
        mensajes={[peligroso]}
        puedeModerar={false}
        onEliminar={vi.fn()}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
  });
});
