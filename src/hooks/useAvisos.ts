"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  mostrarNotificacion,
  nuevosAjenos,
  permisoActual,
  suscribirPermiso,
  tituloConContador,
  type PermisoAvisos,
} from "@/cliente/avisos";
import type { Mensaje } from "@/schemas/mensaje";

/** Permiso de notificaciones del navegador, siempre actualizado (en el servidor se asume "default"). */
export function usePermisoAvisos(): PermisoAvisos {
  return useSyncExternalStore(suscribirPermiso, permisoActual, () => "default");
}

/**
 * Avisa cuando llegan mensajes de otras personas con la pestaña oculta:
 * cuenta en el título de la pestaña y, si hay permiso, muestra una notificación del sistema.
 */
export function useAvisos(
  mensajes: Mensaje[],
  uidPropio: string | null,
  listo: boolean,
  nombreSala: string,
) {
  const vistos = useRef<Set<string> | null>(null);
  const pendientes = useRef(0);
  const tituloBase = useRef("");

  useEffect(() => {
    tituloBase.current = document.title;
    const alVolver = () => {
      if (document.hidden) return;
      pendientes.current = 0;
      document.title = tituloBase.current;
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      document.removeEventListener("visibilitychange", alVolver);
      document.title = tituloBase.current;
    };
  }, []);

  useEffect(() => {
    if (!listo) return;
    if (vistos.current === null) {
      // La primera carga es el historial: no se avisa de lo que ya estaba.
      vistos.current = new Set(mensajes.map((mensaje) => mensaje.id));
      return;
    }
    const ajenos = nuevosAjenos(vistos.current, mensajes, uidPropio);
    const ultimo = ajenos.at(-1);
    if (!ultimo || !document.hidden) return;
    pendientes.current += ajenos.length;
    document.title = tituloConContador(tituloBase.current, pendientes.current);
    mostrarNotificacion(nombreSala, `${ultimo.nombre}: ${ultimo.texto}`);
  }, [mensajes, uidPropio, listo, nombreSala]);
}
