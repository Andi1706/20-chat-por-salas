"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { salir } from "@/cliente/autenticacion";
import { useUsuario } from "./ProveedorUsuario";
import styles from "./Encabezado.module.css";

function Navegacion({ conSesion }: { conSesion: boolean }) {
  if (!conSesion) return null;
  return (
    <nav aria-label="Principal" className={styles.nav}>
      <Link href="/salas">Salas</Link>
      <Link href="/salas/nueva">Nueva sala</Link>
      <Link href="/perfil">Perfil</Link>
    </nav>
  );
}

function AccionSesion({ conSesion }: { conSesion: boolean }) {
  const router = useRouter();
  const { recargar } = useUsuario();
  const [saliendo, setSaliendo] = useState(false);

  async function cerrar() {
    setSaliendo(true);
    try {
      await salir();
    } finally {
      recargar();
      router.push("/login");
      setSaliendo(false);
    }
  }

  if (!conSesion) return <Link href="/login">Entrar</Link>;
  return (
    <button type="button" className="boton boton-secundario" onClick={cerrar} disabled={saliendo}>
      {saliendo ? "Saliendo…" : "Salir"}
    </button>
  );
}

export function Encabezado() {
  const { estado, usuario } = useUsuario();
  // En /salas la barra lateral ya trae el perfil y "Salir": no se repite el encabezado.
  const enSalas = usePathname().startsWith("/salas");
  if (enSalas) return null;
  const conSesion = estado === "conSesion";
  return (
    <header className={styles.encabezado}>
      <div className={styles.contenido}>
        <Link href="/salas" className={styles.marca}>
          Chat por salas
        </Link>
        <Navegacion conSesion={conSesion} />
        <div className={styles.sesion}>
          {usuario && <span className={styles.nombre}>{usuario.nombre}</span>}
          <AccionSesion conSesion={conSesion} />
        </div>
      </div>
    </header>
  );
}
