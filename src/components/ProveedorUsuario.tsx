"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";
import { useCargar } from "@/hooks/useCargar";

export interface Usuario {
  uid: string;
  correo: string;
  nombre: string;
  rol: string;
}

interface Valor {
  estado: "cargando" | "conSesion" | "sinSesion";
  usuario: Usuario | null;
  recargar: () => void;
}

const Contexto = createContext<Valor>({ estado: "cargando", usuario: null, recargar: () => {} });

const SIN_SESION: Valor = { estado: "sinSesion", usuario: null, recargar: () => {} };

/** Pregunta una sola vez a `/api/auth/yo` quién es el usuario y lo comparte con toda la interfaz. */
function ConUsuarioCargado({ children }: { children: ReactNode }) {
  const carga = useCargar<{ usuario: Usuario }>("/api/auth/yo");
  const valor: Valor = {
    estado:
      carga.estado === "listo" ? "conSesion" : carga.estado === "error" ? "sinSesion" : "cargando",
    usuario: carga.estado === "listo" ? carga.datos.usuario : null,
    recargar: carga.recargar,
  };
  return <Contexto value={valor}>{children}</Contexto>;
}

/**
 * En /login no se pregunta por la sesión: quien llega ahí normalmente no la tiene, y la petición
 * respondería 401 (un error rojo en la consola). Al entrar, la página recarga y ahí sí se consulta.
 */
export function ProveedorUsuario({ children }: { children: ReactNode }) {
  if (usePathname() === "/login") return <Contexto value={SIN_SESION}>{children}</Contexto>;
  return <ConUsuarioCargado>{children}</ConUsuarioCargado>;
}

export function useUsuario(): Valor {
  return useContext(Contexto);
}
