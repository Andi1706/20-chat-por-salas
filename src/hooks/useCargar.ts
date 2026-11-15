"use client";

import { useEffect, useState } from "react";
import { pedirApi } from "@/cliente/api";

type Resultado<T> =
  { ruta: string; estado: "listo"; datos: T } | { ruta: string; estado: "error"; error: Error };

export type Carga<T> =
  { estado: "cargando" } | { estado: "listo"; datos: T } | { estado: "error"; error: Error };

/** Pide una ruta GET de la API y expone los tres estados que la pantalla debe dibujar. */
export function useCargar<T>(ruta: string): Carga<T> & { recargar: () => void } {
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    pedirApi<T>(ruta, { signal: control.signal }).then(
      (datos) => setResultado({ ruta, estado: "listo", datos }),
      (error: Error) => {
        if (error.name !== "AbortError") setResultado({ ruta, estado: "error", error });
      },
    );
    return () => control.abort();
  }, [ruta, version]);

  const recargar = () => {
    setResultado(null);
    setVersion((valor) => valor + 1);
  };
  // Si el resultado guardado es de otra ruta, todavía estamos cargando la nueva.
  const vigente = resultado?.ruta === ruta ? resultado : null;
  return { ...(vigente ?? { estado: "cargando" as const }), recargar };
}
