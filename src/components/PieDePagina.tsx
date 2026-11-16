"use client";

import { usePathname } from "next/navigation";
import styles from "./PieDePagina.module.css";

/** Pie de las páginas de lectura (entrar, perfil). En /salas el pie vive en la barra lateral. */
export function PieDePagina() {
  if (usePathname().startsWith("/salas")) return null;
  return (
    <footer className={styles.pie}>
      <p>Proyecto 20 · Chat por salas · Desarrollo Web</p>
    </footer>
  );
}
