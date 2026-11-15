// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMensajes } from "@/hooks/useMensajes";
import { mensaje, respuestaJson, simularFetch } from "../cliente-helpers";

const PRIMERO = mensaje("m1", "2026-11-14T10:00:00.000Z");
const SEGUNDO = mensaje("m2", "2026-11-14T10:00:03.000Z");

async function avanzar(milisegundos: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milisegundos);
  });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useMensajes", () => {
  it("carga el historial y después trae solo lo nuevo con ?since", async () => {
    const peticion = simularFetch();
    peticion
      .mockResolvedValueOnce(respuestaJson({ items: [PRIMERO], siguienteCursor: null }))
      .mockResolvedValue(respuestaJson({ items: [SEGUNDO], siguienteCursor: null }));

    const { result, unmount } = renderHook(() => useMensajes("sala1"));
    await avanzar(0);
    expect(result.current.estado).toBe("listo");
    expect(result.current.mensajes).toEqual([PRIMERO]);

    await avanzar(2000);
    expect(result.current.mensajes.map((m) => m.id)).toEqual(["m1", "m2"]);
    const urlDelSondeo = String(peticion.mock.calls[1]?.[0]);
    expect(urlDelSondeo).toContain("since=2026-11-14T09%3A59%3A59.000Z");
    unmount();
  });

  it("si falla la red reintenta cada vez más despacio y se recupera solo", async () => {
    const peticion = simularFetch();
    peticion.mockRejectedValue(new TypeError("sin red"));

    const { result, unmount } = renderHook(() => useMensajes("sala1"));
    await avanzar(0);
    expect(peticion).toHaveBeenCalledTimes(1);
    expect(result.current.estado).toBe("error");
    expect(result.current.reconectando).toBe(true);

    await avanzar(3999); // tras el 1.er fallo la espera es 4 s, no 2 s
    expect(peticion).toHaveBeenCalledTimes(1);
    await avanzar(1);
    expect(peticion).toHaveBeenCalledTimes(2);

    await avanzar(7999); // tras el 2.º fallo seguido la espera es 8 s
    expect(peticion).toHaveBeenCalledTimes(2);
    peticion.mockResolvedValue(respuestaJson({ items: [PRIMERO], siguienteCursor: null }));
    await avanzar(1);

    expect(result.current.estado).toBe("listo");
    expect(result.current.reconectando).toBe(false);
    unmount();
  });

  it("con un 401 se detiene y marca la sesión como vencida", async () => {
    const peticion = simularFetch();
    peticion.mockResolvedValue(respuestaJson({ error: "No autenticado" }, 401));

    const { result, unmount } = renderHook(() => useMensajes("sala1"));
    await avanzar(0);
    expect(result.current.estado).toBe("sinSesion");

    await avanzar(60000);
    expect(peticion).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("al desmontar deja de consultar", async () => {
    const peticion = simularFetch();
    peticion.mockResolvedValue(respuestaJson({ items: [], siguienteCursor: null }));

    const { unmount } = renderHook(() => useMensajes("sala1"));
    await avanzar(0);
    unmount();
    const llamadas = peticion.mock.calls.length;
    await avanzar(30000);
    expect(peticion).toHaveBeenCalledTimes(llamadas);
  });
});
