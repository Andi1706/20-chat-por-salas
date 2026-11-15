import type { ReactNode } from "react";
import styles from "./Estados.module.css";

/** Los tres estados que toda pantalla con datos debe mostrar: cargando, vacío y error. */
export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <p role="status" aria-busy="true" className={styles.cargando}>
      <span className={styles.rueda} aria-hidden="true" />
      {texto}
    </p>
  );
}

export function Vacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className={styles.vacio}>
      <p className={styles.titulo}>{titulo}</p>
      {children}
    </div>
  );
}

interface FalloProps {
  mensaje: string;
  onReintentar?: () => void;
  children?: ReactNode;
}

export function Fallo({ mensaje, onReintentar, children }: FalloProps) {
  return (
    <div role="alert" className={styles.fallo}>
      <p>{mensaje}</p>
      {onReintentar && (
        <button type="button" className="boton" onClick={onReintentar}>
          Reintentar
        </button>
      )}
      {children}
    </div>
  );
}
