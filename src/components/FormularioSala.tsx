"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { mensajeDe, pedirApi } from "@/cliente/api";
import { erroresPorCampo } from "@/cliente/formularios";
import { salaNuevaSchema, type Sala } from "@/schemas/sala";
import { Campo } from "./Campo";
import styles from "./Formulario.module.css";

export function FormularioSala() {
  const router = useRouter();
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [fallo, setFallo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    // El mismo esquema Zod que valida en el servidor: la regla vive en un solo lugar.
    const resultado = salaNuevaSchema.safeParse({
      nombre: datos.get("nombre"),
      privada: datos.get("privada") === "on",
    });
    setFallo(null);
    setErrores(resultado.success ? {} : erroresPorCampo(resultado.error));
    if (!resultado.success) return;
    setEnviando(true);
    try {
      const sala = await pedirApi<Sala>("/api/salas", { metodo: "POST", cuerpo: resultado.data });
      router.push(`/salas/${sala.id}`);
    } catch (error) {
      setFallo(mensajeDe(error));
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={alEnviar} noValidate className={styles.formulario}>
      <h1>Nueva sala</h1>
      <Campo
        etiqueta="Nombre de la sala"
        name="nombre"
        type="text"
        maxLength={50}
        error={errores.nombre}
      />
      <label className={styles.casilla}>
        <input type="checkbox" name="privada" />
        Sala privada (solo sus miembros la ven)
      </label>
      {fallo && (
        <p role="alert" className={styles.fallo}>
          {fallo}
        </p>
      )}
      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? "Creando…" : "Crear sala"}
      </button>
    </form>
  );
}
