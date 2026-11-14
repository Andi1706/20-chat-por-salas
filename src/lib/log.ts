/**
 * Registro de solicitudes en JSON, una línea por petición.
 * Nunca debe recibir contraseñas, tokens ni datos personales.
 */
export function registrar(datos: Record<string, string | number>): void {
  process.stdout.write(`${JSON.stringify(datos)}\n`);
}
