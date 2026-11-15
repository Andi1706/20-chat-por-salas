import type { Metadata } from "next";
import { Perfil } from "@/components/Perfil";

export const metadata: Metadata = { title: "Perfil" };

export default function PaginaPerfil() {
  return (
    <div className="contenedor">
      <Perfil />
    </div>
  );
}
