import { useId, type InputHTMLAttributes } from "react";
import styles from "./Campo.module.css";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string;
}

/** Etiqueta + campo + mensaje de error enlazados, para que un lector de pantalla los lea juntos. */
export function Campo({ etiqueta, error, ...resto }: Props) {
  const id = useId();
  const idError = `${id}-error`;
  return (
    <div className={styles.campo}>
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        {...resto}
      />
      {error && (
        <p id={idError} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
