"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BarraLateral } from "./BarraLateral";
import styles from "./MarcoSalas.module.css";

/**
 * Estructura de dos paneles: lista de salas a la izquierda y la sala abierta a la derecha.
 * En pantallas angostas se ve un panel a la vez: la lista en /salas y el chat en /salas/<id>.
 */
export function MarcoSalas({ children }: { children: ReactNode }) {
  const enLista = usePathname() === "/salas";
  return (
    <div className={styles.marco} data-vista={enLista ? "lista" : "sala"}>
      <BarraLateral />
      <section className={styles.panel} aria-label="Sala">
        {children}
      </section>
    </div>
  );
}
