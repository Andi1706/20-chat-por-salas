"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { salir } from "@/cliente/autenticacion";
import { irA } from "@/cliente/navegacion";
import { useSalas } from "@/hooks/useSalas";
import type { Sala } from "@/schemas/sala";
import { Avatar } from "./Avatar";
import { EsqueletoSalas, Fallo, Vacio } from "./Estados";
import { IconoBuscar, IconoMas, IconoSalir } from "./Iconos";
import { useUsuario } from "./ProveedorUsuario";
import styles from "./BarraLateral.module.css";

function Cabecera() {
  const { usuario, recargar } = useUsuario();

  async function cerrarSesion() {
    try {
      await salir();
    } finally {
      recargar();
      irA("/login");
    }
  }

  return (
    <header className={styles.cabecera}>
      <Link href="/perfil" className={styles.yo} aria-label="Tu perfil">
        <Avatar nombre={usuario?.nombre ?? "?"} />
        <span className={styles.nombre}>{usuario?.nombre ?? "Chat por salas"}</span>
      </Link>
      <Link href="/salas/nueva" className={styles.icono} aria-label="Nueva sala">
        <IconoMas />
      </Link>
      <button
        type="button"
        className={styles.icono}
        aria-label="Cerrar sesión"
        onClick={cerrarSesion}
      >
        <IconoSalir />
      </button>
    </header>
  );
}

function Herramientas(props: {
  mias: boolean;
  onCambiar: (valor: boolean) => void;
  busqueda: string;
  onBuscar: (valor: string) => void;
}) {
  return (
    <div className={styles.herramientas}>
      <div className={styles.buscador}>
        <IconoBuscar />
        <label htmlFor="buscar-sala" className="solo-lector">
          Buscar sala
        </label>
        <input
          id="buscar-sala"
          type="search"
          placeholder="Buscar sala"
          value={props.busqueda}
          onChange={(evento) => props.onBuscar(evento.target.value)}
        />
      </div>
      <div role="group" aria-label="Qué salas ver" className={styles.filtro}>
        <button type="button" aria-pressed={!props.mias} onClick={() => props.onCambiar(false)}>
          Públicas
        </button>
        <button type="button" aria-pressed={props.mias} onClick={() => props.onCambiar(true)}>
          Mis salas
        </button>
      </div>
    </div>
  );
}

function FilaSala({ sala, activa }: { sala: Sala; activa: boolean }) {
  const cantidad = sala.miembros.length;
  return (
    <li>
      <Link
        href={`/salas/${sala.id}`}
        className={styles.fila}
        aria-current={activa ? "page" : undefined}
      >
        <Avatar nombre={sala.nombre} />
        <span className={styles.texto}>
          <span className={styles.titulo}>{sala.nombre}</span>
          <span className={styles.detalle}>
            {sala.privada ? "Privada" : "Pública"} · {cantidad}{" "}
            {cantidad === 1 ? "miembro" : "miembros"}
          </span>
        </span>
      </Link>
    </li>
  );
}

function SinSalas({ mias, termino }: { mias: boolean; termino: string }) {
  const titulo = mias ? "Aún no estás en ninguna sala" : "Todavía no hay salas";
  return (
    <Vacio titulo={termino ? "Ninguna sala coincide" : titulo}>
      {!termino && (
        <Link href="/salas/nueva" className="boton">
          Crear una sala
        </Link>
      )}
    </Vacio>
  );
}

function Contenido(props: {
  salas: ReturnType<typeof useSalas>;
  mias: boolean;
  termino: string;
  rutaActual: string;
}) {
  const { salas, mias, termino, rutaActual } = props;
  const visibles = salas.items.filter((sala) => sala.nombre.toLowerCase().includes(termino));

  return (
    <>
      {salas.estado === "cargando" && <EsqueletoSalas />}
      {salas.estado === "error" && (
        <Fallo
          mensaje={salas.error ?? "No se pudieron cargar las salas"}
          onReintentar={salas.recargar}
        />
      )}
      {salas.estado === "listo" && visibles.length === 0 && (
        <SinSalas mias={mias} termino={termino} />
      )}
      <ul className={styles.salas}>
        {visibles.map((sala) => (
          <FilaSala key={sala.id} sala={sala} activa={rutaActual === `/salas/${sala.id}`} />
        ))}
      </ul>
      {salas.hayMas && (
        <button
          type="button"
          className="boton-texto"
          onClick={salas.verMas}
          disabled={salas.cargandoMas}
        >
          {salas.cargandoMas ? "Cargando…" : "Ver más salas"}
        </button>
      )}
    </>
  );
}

export function BarraLateral() {
  const [mias, setMias] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const salas = useSalas(mias);
  const rutaActual = usePathname();

  return (
    <aside className={styles.barra} aria-label="Salas">
      <Cabecera />
      <Herramientas mias={mias} onCambiar={setMias} busqueda={busqueda} onBuscar={setBusqueda} />
      <div className={styles.lista}>
        <Contenido
          salas={salas}
          mias={mias}
          termino={busqueda.trim().toLowerCase()}
          rutaActual={rutaActual}
        />
      </div>
      <footer className={styles.pie}>Chat por salas · Next.js y Firebase</footer>
    </aside>
  );
}
