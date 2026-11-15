"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { mensajeDe, pedirApi } from "@/cliente/api";
import { combinarMensajes } from "@/cliente/polling";
import { Sondeo } from "@/cliente/sondeo";
import type { Pagina } from "@/schemas/comun";
import type { Mensaje } from "@/schemas/mensaje";

export type EstadoMensajes = "cargando" | "listo" | "error" | "sinSesion";

const TAMANO_HISTORIAL = 30;
type Poner<T> = Dispatch<SetStateAction<T>>;

/** Enviar y eliminar: llaman a la API y actualizan la lista sin esperar al próximo sondeo. */
function useAcciones(ruta: string, setMensajes: Poner<Mensaje[]>) {
  /** Lanza el error si la API rechaza el mensaje (400, 403, 429...): el formulario lo muestra. */
  const enviar = useCallback(
    async (texto: string) => {
      const creado = await pedirApi<Mensaje>(ruta, { metodo: "POST", cuerpo: { texto } });
      setMensajes((actuales) => combinarMensajes(actuales, [creado]));
    },
    [ruta, setMensajes],
  );
  const eliminar = useCallback(
    async (id: string) => {
      await pedirApi(`${ruta}/${id}`, { metodo: "DELETE" });
      setMensajes((actuales) => actuales.filter((mensaje) => mensaje.id !== id));
    },
    [ruta, setMensajes],
  );
  return { enviar, eliminar };
}

/** Historial hacia atrás: pide la página anterior con el cursor que dio el servidor. */
function useHistorial(ruta: string, setMensajes: Poner<Mensaje[]>, setError: Poner<string | null>) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);

  const verAnteriores = useCallback(async () => {
    if (!cursor) return;
    setCargandoMas(true);
    try {
      const url = `${ruta}?limite=${TAMANO_HISTORIAL}&cursor=${encodeURIComponent(cursor)}`;
      const pagina = await pedirApi<Pagina<Mensaje>>(url);
      setMensajes((actuales) => combinarMensajes(actuales, pagina.items));
      setCursor(pagina.siguienteCursor);
    } catch (fallo) {
      setError(mensajeDe(fallo));
    } finally {
      setCargandoMas(false);
    }
  }, [cursor, ruta, setMensajes, setError]);

  return { cursor, setCursor, cargandoMas, verAnteriores };
}

/**
 * Mantiene la lista de mensajes de una sala al día. El trabajo de red está en la clase `Sondeo`;
 * este hook solo lo conecta con el estado de React.
 */
export function useMensajes(salaId: string) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [estado, setEstado] = useState<EstadoMensajes>("cargando");
  const [error, setError] = useState<string | null>(null);
  const [reconectando, setReconectando] = useState(false);
  const ruta = `/api/salas/${salaId}/mensajes`;
  const historial = useHistorial(ruta, setMensajes, setError);
  const acciones = useAcciones(ruta, setMensajes);
  const { setCursor } = historial;

  useEffect(() => {
    const sondeo = new Sondeo(salaId, {
      alCargar: (pagina) => {
        setMensajes(pagina.items);
        setCursor(pagina.siguienteCursor);
        setEstado("listo");
        setError(null);
      },
      alLlegar: (nuevos) => setMensajes((actuales) => combinarMensajes(actuales, nuevos)),
      alFallar: (fallo) => {
        setError(fallo.mensaje);
        setReconectando(!fallo.fatal);
        if (fallo.sinSesion) setEstado("sinSesion");
        else if (fallo.primeraCarga) setEstado("error");
      },
      alRecuperar: () => {
        setReconectando(false);
        setError(null);
      },
    });
    sondeo.iniciar();
    return () => sondeo.detener();
  }, [salaId, setCursor]);

  return {
    mensajes,
    estado,
    error,
    reconectando,
    hayMas: historial.cursor !== null,
    cargandoMas: historial.cargandoMas,
    verAnteriores: historial.verAnteriores,
    ...acciones,
  };
}
