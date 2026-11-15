import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Encabezado } from "@/components/Encabezado";
import { ProveedorUsuario } from "@/components/ProveedorUsuario";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Chat por salas", template: "%s · Chat por salas" },
  description: "Chat por salas casi en tiempo real, hecho con Next.js y Firebase.",
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
        </ProveedorUsuario>
      </body>
    </html>
  );
}
