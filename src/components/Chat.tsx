"use client";

import Link from "next/link";
import { useState } from "react";
import { mensajeDe, pedirApi } from "@/cliente/api";
import { ErrorApi } from "@/cliente/api";
import { useCargar } from "@/hooks/useCargar";
import type { Sala } from "@/schemas/sala";
import { Avatar } from "./Avatar";
import { BotonAvisos } from "./BotonAvisos";
import { Cargando, Fallo } from "./Estados";
import { IconoAtras } from "./Iconos";
import { PanelMensajes } from "./PanelMensajes";
import { useUsuario, type Usuario } from "./ProveedorUsuario";
import styles from "./Chat.module.css";

function textoDeFallo(error: Error): string {
  if (error instanceof ErrorApi && error.status === 403)
    return "Esta sala es privada y no eres miembro.";
  if (error instanceof ErrorApi && error.status === 404) return "Esa sala no existe.";
  return error.message;
}

function Unirse({ salaId, onListo }: { salaId: string; onListo: () => void }) {
  const [error, setError] = useState<string | null>(null);
  async function unirse() {
    try {
      await pedirApi(`/api/salas/${salaId}/unirse`, { metodo: "POST" });
      onListo();
    } catch (fallo) {
      setError(mensajeDe(fallo));
    }
  }
  return (
    <div className={styles.unirse}>
      <p>Únete a la sala para escribir.</p>
      <button type="button" className="boton" onClick={() => void unirse()}>
        Unirme a la sala
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

function CabeceraSala({ sala }: { sala: Sala }) {
  const cantidad = sala.miembros.length;
  return (
    <header className={styles.cabecera}>
      <Link href="/salas" className={styles.atras} aria-label="Volver a las salas">
        <IconoAtras />
      </Link>
      <Avatar nombre={sala.nombre} />
      <div className={styles.titulos}>
        <h1 id="nombre-sala">{sala.nombre}</h1>
        <p>
          {sala.privada ? "Privada" : "Pública"} · {cantidad}{" "}
          {cantidad === 1 ? "miembro" : "miembros"}
        </p>
      </div>
      <BotonAvisos />
    </header>
  );
}

function SalaAbierta(props: { sala: Sala; usuario: Usuario; onUnido: () => void }) {
  const { sala, usuario } = props;
  const esMiembro = sala.miembros.includes(usuario.uid);
  return (
    <div className={styles.sala} role="region" aria-labelledby="nombre-sala">
      <CabeceraSala sala={sala} />
      <PanelMensajes sala={sala} usuario={usuario} puedeEscribir={esMiembro} />
      {!esMiembro && <Unirse salaId={sala.id} onListo={props.onUnido} />}
    </div>
  );
}

export function Chat({ salaId }: { salaId: string }) {
  const { usuario } = useUsuario();
  const carga = useCargar<Sala>(`/api/salas/${salaId}`);

  if (carga.estado === "cargando" || !usuario) {
    return (
      <div className={styles.relleno}>
        <Cargando texto="Abriendo la sala…" />
      </div>
    );
  }
  if (carga.estado === "error") {
    return (
      <div className={styles.relleno}>
        <Fallo mensaje={textoDeFallo(carga.error)}>
          <Link href="/salas">Volver a las salas</Link>
        </Fallo>
      </div>
    );
  }
  return <SalaAbierta sala={carga.datos} usuario={usuario} onUnido={carga.recargar} />;
}
