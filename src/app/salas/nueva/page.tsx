import type { Metadata } from "next";
import { FormularioSala } from "@/components/FormularioSala";

export const metadata: Metadata = { title: "Nueva sala" };

export default function PaginaNuevaSala() {
  return (
    <div className="contenedor" style={{ width: "100%", overflowY: "auto" }}>
      <FormularioSala />
    </div>
  );
}
