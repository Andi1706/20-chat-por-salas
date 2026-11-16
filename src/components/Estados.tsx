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

/** Esqueleto de la conversación: burbujas grises mientras llegan los mensajes (evita saltos de diseño). */
export function EsqueletoMensajes() {
  return (
    <div role="status" aria-busy="true" className={styles.esqueleto}>
      <span className="solo-lector">Cargando mensajes…</span>
      <div aria-hidden="true" className={styles.burbujas}>
        {[60, 40, 75, 50].map((ancho, indice) => (
          <span
            key={ancho}
            className={indice % 2 === 0 ? styles.burbuja : styles.burbujaPropia}
            style={{ width: `${ancho}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Esqueleto de la lista de salas. */
export function EsqueletoSalas() {
  return (
    <div role="status" aria-busy="true" className={styles.esqueleto}>
      <span className="solo-lector">Cargando salas…</span>
      <div aria-hidden="true" className={styles.filas}>
        {[0, 1, 2, 3, 4].map((numero) => (
          <span key={numero} className={styles.fila} />
        ))}
      </div>
    </div>
  );
}
