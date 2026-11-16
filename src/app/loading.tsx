import { Cargando } from "@/components/Estados";

/** Next.js lo muestra mientras carga cualquier ruta que aún no tiene su propio loading. */
export default function CargandoPagina() {
  return (
    <div className="contenedor">
      <Cargando texto="Cargando…" />
    </div>
  );
}
