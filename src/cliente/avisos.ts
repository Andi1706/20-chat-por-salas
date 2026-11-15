import type { Mensaje } from "@/schemas/mensaje";

export type PermisoAvisos = NotificationPermission | "no-disponible";

/** Mensajes que aún no se habían visto y que escribió otra persona. */
export function nuevosAjenos(vistos: Set<string>, mensajes: Mensaje[], uidPropio: string | null) {
  const nuevos = mensajes.filter((mensaje) => !vistos.has(mensaje.id));
  for (const mensaje of nuevos) vistos.add(mensaje.id);
  return nuevos.filter((mensaje) => mensaje.uid !== uidPropio);
}

/** Si la Notifications API no sirve (móviles, permiso negado), el contador en el título es el plan B. */
export function tituloConContador(base: string, pendientes: number): string {
  return pendientes > 0 ? `(${pendientes}) ${base}` : base;
}

export function permisoActual(): PermisoAvisos {
  return typeof Notification === "undefined" ? "no-disponible" : Notification.permission;
}

const oyentes = new Set<() => void>();

export function suscribirPermiso(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

/** Debe llamarse desde un clic: los navegadores no dejan pedir permiso de otra forma. */
export async function pedirPermiso(): Promise<void> {
  if (typeof Notification === "undefined") return;
  await Notification.requestPermission();
  oyentes.forEach((oyente) => oyente());
}

export function mostrarNotificacion(titulo: string, cuerpo: string): void {
  if (permisoActual() !== "granted") return;
  try {
    new Notification(titulo, { body: cuerpo });
  } catch {
    // Algunos navegadores móviles lanzan error: el contador del título ya avisa.
  }
}
