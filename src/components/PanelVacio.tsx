import styles from "./PanelVacio.module.css";

/** Lo que se ve a la derecha en pantallas anchas cuando todavía no hay una sala abierta. */
export function PanelVacio() {
  return (
    <div className={styles.vacio}>
      <h1>Elige una sala</h1>
      <p>Abre una de la lista para leer y escribir. Los mensajes nuevos aparecen solos.</p>
    </div>
  );
}
