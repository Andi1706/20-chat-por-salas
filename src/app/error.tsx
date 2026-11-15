"use client";

import { Fallo } from "@/components/Estados";

/** Última red de seguridad: si una pantalla se rompe, se muestra esto en vez de una página en blanco. */
export default function ErrorDePagina({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="contenedor">
      <Fallo mensaje="Algo salió mal al mostrar esta página." onReintentar={reset} />
    </div>
  );
}
