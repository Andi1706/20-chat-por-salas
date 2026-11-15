import type { CSSProperties } from "react";
import { iniciales, tonoDe } from "@/cliente/avatar";
import styles from "./Avatar.module.css";

/** Círculo con las iniciales; el color sale del nombre, así cada sala siempre se ve igual. */
export function Avatar({ nombre, grande = false }: { nombre: string; grande?: boolean }) {
  const estilo = { "--tono": tonoDe(nombre) } as CSSProperties;
  return (
    <span
      className={grande ? `${styles.avatar} ${styles.grande}` : styles.avatar}
      style={estilo}
      aria-hidden="true"
    >
      {iniciales(nombre)}
    </span>
  );
}
