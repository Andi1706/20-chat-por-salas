"use client";

import { useCallback, useEffect, useState } from "react";
import { mensajeDe, pedirApi } from "@/cliente/api";
import type { Pagina } from "@/schemas/comun";
import type { Sala } from "@/schemas/sala";

const TAMANO = 20;

interface Datos {
  clave: string;
  items: Sala[];
  cursor: string | null;
  error: string | null;
}

/** Cargando mientras no haya datos de ESTA consulta; error solo si no hay nada que mostrar. */
function estadoDe(datos: Datos | null): "cargando" | "error" | "listo" {
  if (datos === null) return "cargando";
  return datos.error !== null && datos.items.length === 0 ? "error" : "listo";
}

/** Lista de salas con paginación por cursor (`siguienteCursor`). `mias` alterna entre públicas y mías. */
export function useSalas(mias: boolean) {
  const clave = `/api/salas?mias=${mias}&limite=${TAMANO}`;
  const [guardados, setDatos] = useState<Datos | null>(null);
  const [version, setVersion] = useState(0);
  const [cargandoMas, setCargandoMas] = useState(false);
  const datos = guardados?.clave === clave ? guardados : null;

  useEffect(() => {
    const control = new AbortController();
    pedirApi<Pagina<Sala>>(clave, { signal: control.signal }).then(
      (pagina) =>
        setDatos({ clave, items: pagina.items, cursor: pagina.siguienteCursor, error: null }),
      (fallo: Error) => {
        if (fallo.name !== "AbortError") {
          setDatos({ clave, items: [], cursor: null, error: fallo.message });
        }
      },
    );
    return () => control.abort();
  }, [clave, version]);

  const verMas = useCallback(async () => {
    if (!datos?.cursor) return;
    setCargandoMas(true);
    try {
      const url = `${clave}&cursor=${encodeURIComponent(datos.cursor)}`;
      const pagina = await pedirApi<Pagina<Sala>>(url);
      const items = [...datos.items, ...pagina.items];
      setDatos({ clave, items, cursor: pagina.siguienteCursor, error: null });
    } catch (fallo) {
      setDatos({ ...datos, error: mensajeDe(fallo) });
    } finally {
      setCargandoMas(false);
    }
  }, [clave, datos]);

  const recargar = () => {
    setDatos(null);
    setVersion((valor) => valor + 1);
  };
  return {
    estado: estadoDe(datos),
    items: datos?.items ?? [],
    error: datos?.error ?? null,
    hayMas: datos?.cursor !== null && datos?.cursor !== undefined,
    cargandoMas,
    verMas,
    recargar,
  };
}
