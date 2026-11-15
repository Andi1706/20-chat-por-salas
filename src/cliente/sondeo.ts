import type { Pagina } from "@/schemas/comun";
import type { Mensaje } from "@/schemas/mensaje";
import { ErrorApi, mensajeDe, pedirApi } from "./api";
import { calcularEspera, marcaDeSondeo } from "./polling";

export interface FalloDeSondeo {
  mensaje: string;
  /** 401: la sesión venció; hay que volver a entrar. */
  sinSesion: boolean;
  /** Errores que no se arreglan reintentando (401, 403, 404): el sondeo se detiene. */
  fatal: boolean;
  primeraCarga: boolean;
}

export interface EventosDeSondeo {
  alCargar(pagina: Pagina<Mensaje>): void;
  alLlegar(nuevos: Mensaje[]): void;
  alFallar(fallo: FalloDeSondeo): void;
  alRecuperar(): void;
}

const TAMANO_PAGINA = 50;

/**
 * Consulta la API cada pocos segundos (sondeo corto): la primera vez trae el historial reciente y
 * después solo lo posterior a la última marca. No usa React, así se prueba con reloj falso.
 */
export class Sondeo {
  private readonly control = new AbortController();
  private readonly ruta: string;
  private temporizador: ReturnType<typeof setTimeout> | undefined;
  private desde: string | null = null;
  private fallos = 0;
  private activo = true;
  private enCurso = false;

  constructor(
    salaId: string,
    private readonly eventos: EventosDeSondeo,
  ) {
    this.ruta = `/api/salas/${salaId}/mensajes`;
  }

  iniciar(): void {
    document.addEventListener("visibilitychange", this.alCambiarVisibilidad);
    void this.ciclo();
  }

  detener(): void {
    this.activo = false;
    clearTimeout(this.temporizador);
    this.control.abort();
    document.removeEventListener("visibilitychange", this.alCambiarVisibilidad);
  }

  /** Al volver a la pestaña no se espera al temporizador: se consulta de inmediato. */
  private alCambiarVisibilidad = (): void => {
    if (document.hidden) return;
    clearTimeout(this.temporizador);
    void this.ciclo();
  };

  private async ciclo(): Promise<void> {
    if (!this.activo || this.enCurso) return;
    this.enCurso = true;
    let seguir = true;
    try {
      await (this.desde === null ? this.cargarInicio() : this.sondear(this.desde));
      this.recuperar();
    } catch (error) {
      seguir = this.fallar(error);
    }
    this.enCurso = false;
    if (seguir && this.activo) this.programar();
  }

  private async cargarInicio(): Promise<void> {
    const url = `${this.ruta}?limite=${TAMANO_PAGINA}`;
    const pagina = await pedirApi<Pagina<Mensaje>>(url, { signal: this.control.signal });
    this.desde = marcaDeSondeo(pagina.items);
    this.eventos.alCargar(pagina);
  }

  private async sondear(marca: string): Promise<void> {
    const url = `${this.ruta}?since=${encodeURIComponent(marca)}`;
    const { items } = await pedirApi<Pagina<Mensaje>>(url, { signal: this.control.signal });
    if (items.length === 0) return;
    this.desde = marcaDeSondeo(items);
    this.eventos.alLlegar(items);
  }

  private recuperar(): void {
    if (this.fallos === 0) return;
    this.fallos = 0;
    this.eventos.alRecuperar();
  }

  /** Devuelve true si conviene volver a intentar. */
  private fallar(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "AbortError") return false;
    const status = error instanceof ErrorApi ? error.status : 0;
    const sinSesion = status === 401;
    const fatal = sinSesion || status === 403 || status === 404;
    this.fallos += 1;
    this.eventos.alFallar({
      mensaje: mensajeDe(error),
      sinSesion,
      fatal,
      primeraCarga: this.desde === null,
    });
    return !fatal;
  }

  private programar(): void {
    const espera = calcularEspera(this.fallos, !document.hidden);
    this.temporizador = setTimeout(() => void this.ciclo(), espera);
  }
}
