import type { ZodError } from "zod";

export interface DetalleError {
  campo: string;
  mensaje: string;
}

/** Error esperado de la aplicación: lleva el código HTTP que debe responder la API. */
export class ErrorApp extends Error {
  readonly status: number;
  readonly detalles: DetalleError[] | undefined;

  constructor(status: number, mensaje: string, detalles?: DetalleError[]) {
    super(mensaje);
    this.name = "ErrorApp";
    this.status = status;
    this.detalles = detalles;
  }
}

export function detallesDeZod(error: ZodError): DetalleError[] {
  return error.issues.map((problema) => ({
    campo: problema.path.join("."),
    mensaje: problema.message,
  }));
}
