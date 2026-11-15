"use client";

import type { CSSProperties } from "react";
import { tonoDe } from "@/cliente/avatar";
import { prepararFilas } from "@/cliente/filas";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import type { Mensaje } from "@/schemas/mensaje";
import styles from "./ListaMensajes.module.css";

/** Un mensaje en pantalla; `pendiente` marca el que se muestra antes de que el servidor responda. */
export type MensajeVista = Mensaje & { pendiente?: boolean };

interface Props {
  mensajes: MensajeVista[];
  uidPropio: string | null;
  puedeModerar: boolean;
  hayMas: boolean;
  cargandoMas: boolean;
  onVerAnteriores: () => void;
  onEliminar: (id: string) => void;
}

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

function clasesDe(propio: boolean, primero: boolean): string {
  return [styles.mensaje, propio ? styles.propio : "", primero ? styles.primero : ""].join(" ");
}

function Burbuja(props: {
  mensaje: MensajeVista;
  propio: boolean;
  primero: boolean;
  puedeModerar: boolean;
  onEliminar: (id: string) => void;
}) {
  const { mensaje, propio, primero, puedeModerar, onEliminar } = props;
  const tono = { "--tono": tonoDe(mensaje.nombre) } as CSSProperties;
  return (
    <article className={clasesDe(propio, primero)} style={tono}>
      {propio && <span className="solo-lector">Tú: </span>}
      {!propio && primero && <strong className={styles.autor}>{mensaje.nombre}</strong>}
      <p className={styles.texto}>{mensaje.texto}</p>
      <footer className={styles.pie}>
        {puedeModerar && !mensaje.pendiente && (
          <button
            type="button"
            className={styles.eliminar}
            aria-label={`Eliminar el mensaje de ${mensaje.nombre}`}
            onClick={() => onEliminar(mensaje.id)}
          >
            Eliminar
          </button>
        )}
        {mensaje.pendiente && <span>Enviando…</span>}
        <time dateTime={mensaje.creadoEn}>{hora(mensaje.creadoEn)}</time>
      </footer>
    </article>
  );
}

function Filas(props: Props) {
  return prepararFilas(props.mensajes).map((fila, indice) =>
    fila.tipo === "dia" ? (
      <p key={`dia-${indice}`} className={styles.dia}>
        <span>{fila.etiqueta}</span>
      </p>
    ) : (
      <Burbuja
        key={fila.mensaje.id}
        mensaje={fila.mensaje}
        propio={fila.mensaje.uid === props.uidPropio}
        primero={fila.primero}
        puedeModerar={props.puedeModerar}
        onEliminar={props.onEliminar}
      />
    ),
  );
}

export function ListaMensajes(props: Props) {
  const ultimo = props.mensajes.at(-1);
  const { contenedor, alDesplazar, alFinal, irAlFinal } = useAutoScroll<HTMLDivElement>(
    props.mensajes.length,
    ultimo !== undefined && ultimo.uid === props.uidPropio,
  );

  return (
    <div className={styles.zona}>
      <div
        ref={contenedor}
        onScroll={alDesplazar}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Mensajes de la sala"
        tabIndex={0}
        className={styles.registro}
      >
        {props.hayMas && (
          <button
            type="button"
            className={styles.anteriores}
            onClick={props.onVerAnteriores}
            disabled={props.cargandoMas}
          >
            {props.cargandoMas ? "Cargando…" : "Ver mensajes anteriores"}
          </button>
        )}
        {props.mensajes.length === 0 && (
          <p className={styles.vacio}>Aún no hay mensajes. Escribe el primero.</p>
        )}
        <Filas {...props} />
      </div>
      {!alFinal && (
        <button
          type="button"
          className={styles.alFinal}
          onClick={irAlFinal}
          aria-label="Ir al último mensaje"
        >
          ↓
        </button>
      )}
    </div>
  );
}
