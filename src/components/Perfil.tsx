"use client";

import { Cargando, Fallo } from "./Estados";
import { useUsuario } from "./ProveedorUsuario";
import styles from "./Perfil.module.css";

export function Perfil() {
  const { estado, usuario } = useUsuario();
  if (estado === "cargando") return <Cargando />;
  if (!usuario) return <Fallo mensaje="Necesitas iniciar sesión para ver tu perfil." />;
  return (
    <section aria-labelledby="titulo-perfil">
      <h1 id="titulo-perfil">Tu perfil</h1>
      <dl className={styles.datos}>
        <dt>Nombre</dt>
        <dd>{usuario.nombre}</dd>
        <dt>Correo</dt>
        <dd>{usuario.correo}</dd>
        <dt>Rol</dt>
        <dd>{usuario.rol}</dd>
      </dl>
    </section>
  );
}
