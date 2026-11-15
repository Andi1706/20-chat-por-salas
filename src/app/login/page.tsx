import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioLogin } from "@/components/FormularioLogin";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaLogin() {
  // useSearchParams (en el formulario) exige un Suspense al construir la página.
  return (
    <div className="contenedor">
      <Suspense>
        <FormularioLogin />
      </Suspense>
    </div>
  );
}
