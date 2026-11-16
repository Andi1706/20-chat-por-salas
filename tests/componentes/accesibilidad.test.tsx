// @vitest-environment jsdom
import { render } from "@testing-library/react";
import axe from "axe-core";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/login",
}));

import { EsqueletoMensajes, EsqueletoSalas, Fallo, Vacio } from "@/components/Estados";
import { FormularioLogin } from "@/components/FormularioLogin";
import { FormularioMensaje } from "@/components/FormularioMensaje";
import { ListaMensajes } from "@/components/ListaMensajes";
import { PieDePagina } from "@/components/PieDePagina";

/** jsdom no calcula colores ni diseño, así que el contraste se mide aparte (Lighthouse y axe en el navegador). */
async function problemas(contenedor: HTMLElement): Promise<string[]> {
  const resultado = await axe.run(contenedor, { rules: { "color-contrast": { enabled: false } } });
  return resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`);
}

const mensajes = [
  { id: "1", uid: "a", nombre: "Ana", texto: "Hola", creadoEn: "2026-05-01T10:00:00.000Z" },
  { id: "2", uid: "b", nombre: "Beto", texto: "¿Qué tal?", creadoEn: "2026-05-01T10:01:00.000Z" },
];

// axe intenta usar <canvas>, que jsdom no trae; con esto se evita el aviso en la consola.
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = () => null;
});

describe("accesibilidad con axe", () => {
  it("formulario de entrada", async () => {
    const { container } = render(<FormularioLogin />);
    expect(await problemas(container)).toEqual([]);
  });

  it("formulario de mensaje", async () => {
    const { container } = render(<FormularioMensaje onEnviar={async () => null} />);
    expect(await problemas(container)).toEqual([]);
  });

  it("lista de mensajes", async () => {
    const { container } = render(
      <ListaMensajes
        mensajes={mensajes}
        uidPropio="a"
        puedeModerar
        hayMas
        cargandoMas={false}
        onVerAnteriores={() => undefined}
        onEliminar={() => undefined}
      />,
    );
    expect(await problemas(container)).toEqual([]);
  });

  it("estados de carga, vacío y error", async () => {
    const { container } = render(
      <div>
        <EsqueletoMensajes />
        <EsqueletoSalas />
        <Vacio titulo="Todavía no hay salas" />
        <Fallo mensaje="No se pudo cargar" onReintentar={() => undefined} />
      </div>,
    );
    expect(await problemas(container)).toEqual([]);
  });

  it("pie de página", async () => {
    const { container } = render(<PieDePagina />);
    expect(container.querySelector("footer")).not.toBeNull();
    expect(await problemas(container)).toEqual([]);
  });
});
