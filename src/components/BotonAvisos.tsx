"use client";

import { pedirPermiso } from "@/cliente/avisos";
import { usePermisoAvisos } from "@/hooks/useAvisos";

/** Pide permiso de notificaciones. Si se niega o no existe, el contador en el título sigue funcionando. */
export function BotonAvisos() {
  const permiso = usePermisoAvisos();
  if (permiso === "no-disponible") return null;
  if (permiso === "granted") return <span className="etiqueta-suave">Avisos activados</span>;
  if (permiso === "denied") {
    return (
      <span className="etiqueta-suave" title="Verás un contador en la pestaña">
        Avisos bloqueados
      </span>
    );
  }
  return (
    <button type="button" className="boton boton-secundario" onClick={() => void pedirPermiso()}>
      Activar avisos
    </button>
  );
}
