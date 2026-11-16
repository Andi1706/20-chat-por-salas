import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Encabezado } from "@/components/Encabezado";
import { PieDePagina } from "@/components/PieDePagina";
import { ProveedorUsuario } from "@/components/ProveedorUsuario";
import { urlDelSitio } from "@/lib/sitio";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Chat por salas", template: "%s · Chat por salas" },
  description: "Chat por salas casi en tiempo real, hecho con Next.js y Firebase.",
  metadataBase: new URL(urlDelSitio()),
  openGraph: {
    title: "Chat por salas",
    description: "Chat por salas casi en tiempo real, hecho con Next.js y Firebase.",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a href="#contenido" className="saltar">
          Saltar al contenido
        </a>
        <ProveedorUsuario>
          <Encabezado />
          <main id="contenido" className="principal">
            {children}
          </main>
          <PieDePagina />
        </ProveedorUsuario>
      </body>
    </html>
  );
}
