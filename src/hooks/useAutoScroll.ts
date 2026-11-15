"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

const MARGEN_PX = 80;

/**
 * Mantiene la lista pegada al final cuando llegan mensajes, salvo que la persona haya subido a leer
 * (en ese caso no se le quita el scroll). `useLayoutEffect` mueve el scroll antes de pintar, sin saltos.
 */
export function useAutoScroll<T extends HTMLElement>(cantidad: number, forzar: boolean) {
  const contenedor = useRef<T>(null);
  const pegado = useRef(true);
  const [alFinal, setAlFinal] = useState(true);

  useLayoutEffect(() => {
    const elemento = contenedor.current;
    if (!elemento || !(pegado.current || forzar)) return;
    elemento.scrollTop = elemento.scrollHeight;
    pegado.current = true;
  }, [cantidad, forzar]);

  const alDesplazar = useCallback(() => {
    const elemento = contenedor.current;
    if (!elemento) return;
    const distancia = elemento.scrollHeight - elemento.scrollTop - elemento.clientHeight;
    pegado.current = distancia < MARGEN_PX;
    setAlFinal(pegado.current);
  }, []);

  const irAlFinal = useCallback(() => {
    const elemento = contenedor.current;
    if (elemento) elemento.scrollTop = elemento.scrollHeight;
  }, []);

  return { contenedor, alDesplazar, alFinal, irAlFinal };
}
