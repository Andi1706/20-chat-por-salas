"use client";

import { useOptimistic, useTransition } from "react";
import { mensajeDe } from "@/cliente/api";
import { useAvisos } from "@/hooks/useAvisos";
import { useMensajes } from "@/hooks/useMensajes";
import type { Sala } from "@/schemas/sala";
import { Cargando, Fallo } from "./Estados";
import { FormularioMensaje } from "./FormularioMensaje";
import { ListaMensajes, type MensajeVista } from "./ListaMensajes";
import type { Usuario } from "./ProveedorUsuario";
import styles from "./PanelMensajes.module.css";

interface Props {
  sala: Sala;
  usuario: Usuario;
  puedeEscribir: boolean;
}

/**
 * useOptimistic muestra tu mensaje al instante (marcado "Enviando…"); cuando la API responde,
 * el mensaje real lo reemplaza y, si la API lo rechaza, el provisional desaparece solo.
 */
function useEnvioOptimista(datos: ReturnType<typeof useMensajes>, usuario: Usuario) {
  const [, iniciarTransicion] = useTransition();
  const [visibles, agregarProvisional] = useOptimistic<MensajeVista[], MensajeVista>(
    datos.mensajes,
    (actuales, nuevo) => [...actuales, nuevo],
  );

  const enviarTexto = (texto: string) =>
    new Promise<string | null>((resolver) => {
      iniciarTransicion(async () => {
        agregarProvisional({
          id: `provisional-${crypto.randomUUID()}`,
          uid: usuario.uid,
          nombre: usuario.nombre,
          texto,
          creadoEn: new Date().toISOString(),
          pendiente: true,
        });
        try {
          await datos.enviar(texto);
          resolver(null);
        } catch (error) {
          resolver(mensajeDe(error));
        }
      });
    });

  return { visibles, enviarTexto };
}

export function PanelMensajes({ sala, usuario, puedeEscribir }: Props) {
  const datos = useMensajes(sala.id);
  const { visibles, enviarTexto } = useEnvioOptimista(datos, usuario);
  useAvisos(datos.mensajes, usuario.uid, datos.estado === "listo", sala.nombre);

  if (datos.estado === "cargando") return <Cargando texto="Cargando mensajes…" />;
  if (datos.estado === "sinSesion") {
    return <Fallo mensaje="Tu sesión venció. Vuelve a entrar para seguir en la sala." />;
  }
  if (datos.estado === "error") return <Fallo mensaje={`${datos.error}. Reintentando…`} />;

  return (
    <div className={styles.panel}>
      {datos.reconectando && (
        <p role="status" className={styles.aviso}>
          Sin conexión. Reintentando…
        </p>
      )}
      <ListaMensajes
        mensajes={visibles}
        uidPropio={usuario.uid}
        puedeModerar={sala.creadorUid === usuario.uid}
        hayMas={datos.hayMas}
        cargandoMas={datos.cargandoMas}
        onVerAnteriores={() => void datos.verAnteriores()}
        onEliminar={(id) => void datos.eliminar(id)}
      />
      {puedeEscribir && <FormularioMensaje onEnviar={enviarTexto} />}
    </div>
  );
}
