"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  credencialesSchema,
  destinoSeguro,
  entrar,
  mensajeDeFirebase,
} from "@/cliente/autenticacion";
import { erroresPorCampo } from "@/cliente/formularios";
import { Campo } from "./Campo";
import { useUsuario } from "./ProveedorUsuario";
import styles from "./Formulario.module.css";

function useLogin() {
  const router = useRouter();
  const destino = destinoSeguro(useSearchParams().get("siguiente"));
  const { recargar } = useUsuario();
  const [esRegistro, setEsRegistro] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [fallo, setFallo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const resultado = credencialesSchema.safeParse({
      correo: datos.get("correo"),
      clave: datos.get("clave"),
    });
    setFallo(null);
    setErrores(resultado.success ? {} : erroresPorCampo(resultado.error));
    if (!resultado.success) return;
    setEnviando(true);
    try {
      await entrar(resultado.data, esRegistro);
      recargar();
      router.push(destino);
    } catch (error) {
      setFallo(mensajeDeFirebase(error));
      setEnviando(false);
    }
  }

  return { esRegistro, setEsRegistro, errores, fallo, enviando, alEnviar };
}

export function FormularioLogin() {
  const { esRegistro, setEsRegistro, errores, fallo, enviando, alEnviar } = useLogin();
  return (
    <form onSubmit={alEnviar} noValidate className={styles.formulario}>
      <h1>{esRegistro ? "Crear cuenta" : "Entrar"}</h1>
      <Campo
        etiqueta="Correo"
        name="correo"
        type="email"
        autoComplete="email"
        error={errores.correo}
      />
      <Campo
        etiqueta="Contraseña"
        name="clave"
        type="password"
        autoComplete={esRegistro ? "new-password" : "current-password"}
        error={errores.clave}
      />
      {fallo && (
        <p role="alert" className={styles.fallo}>
          {fallo}
        </p>
      )}
      <button type="submit" className="boton" disabled={enviando}>
        {enviando ? "Un momento…" : esRegistro ? "Crear cuenta" : "Entrar"}
      </button>
      <button type="button" className="boton-texto" onClick={() => setEsRegistro(!esRegistro)}>
        {esRegistro ? "Ya tengo cuenta" : "No tengo cuenta: crear una"}
      </button>
    </form>
  );
}
