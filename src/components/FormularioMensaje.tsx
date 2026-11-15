"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { mensajeNuevoSchema } from "@/schemas/mensaje";
import { IconoEnviar } from "./Iconos";
import styles from "./FormularioMensaje.module.css";

const MAXIMO = 500;
const AVISAR_DESDE = 400;

interface Props {
  /** Devuelve `null` si salió bien o el texto del error si la API lo rechazó. */
  onEnviar: (texto: string) => Promise<string | null>;
}

function useEnvio(onEnviar: Props["onEnviar"]) {
  const [texto, setTexto] = useState("");
  const [fallo, setFallo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const resultado = mensajeNuevoSchema.safeParse({ texto });
    if (!resultado.success) {
      setFallo(resultado.error.issues[0]?.message ?? "Mensaje inválido");
      return;
    }
    setFallo(null);
    setEnviando(true);
    const error = await onEnviar(resultado.data.texto);
    setEnviando(false);
    if (error) setFallo(error);
    else setTexto("");
  }

  return { texto, setTexto, fallo, enviando, enviar };
}

export function FormularioMensaje({ onEnviar }: Props) {
  const { texto, setTexto, fallo, enviando, enviar } = useEnvio(onEnviar);

  function alEnviar(evento: FormEvent) {
    evento.preventDefault();
    void enviar();
  }

  /** Enter envía; Mayús+Enter agrega una línea nueva. */
  function alTeclear(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key !== "Enter" || evento.shiftKey || evento.nativeEvent.isComposing) return;
    evento.preventDefault();
    if (!enviando) void enviar();
  }

  return (
    <form onSubmit={alEnviar} noValidate className={styles.formulario}>
      {fallo && (
        <p role="alert" className={styles.error}>
          {fallo}
        </p>
      )}
      <label htmlFor="texto-mensaje" className="solo-lector">
        Escribe un mensaje
      </label>
      <textarea
        id="texto-mensaje"
        rows={1}
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        onKeyDown={alTeclear}
        placeholder="Escribe un mensaje"
        aria-describedby="ayuda-mensaje"
        aria-invalid={fallo ? true : undefined}
      />
      <button type="submit" className={styles.enviar} disabled={enviando} aria-label="Enviar">
        <IconoEnviar />
      </button>
      <p id="ayuda-mensaje" className="solo-lector">
        Enter envía, Mayús más Enter agrega una línea. Máximo {MAXIMO} caracteres.
      </p>
      {texto.length >= AVISAR_DESDE && (
        <p className={styles.contador}>
          {texto.length}/{MAXIMO}
        </p>
      )}
    </form>
  );
}
