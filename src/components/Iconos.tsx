import type { ReactNode } from "react";

/** Iconos de trazo simple, decorativos: el botón que los usa lleva su propio texto accesible. */
function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconoEnviar = () => (
  <Icono>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </Icono>
);

export const IconoMas = () => (
  <Icono>
    <path d="M12 5v14M5 12h14" />
  </Icono>
);

export const IconoAtras = () => (
  <Icono>
    <path d="m15 18-6-6 6-6" />
  </Icono>
);

export const IconoBuscar = () => (
  <Icono>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icono>
);

export const IconoSalir = () => (
  <Icono>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </Icono>
);
