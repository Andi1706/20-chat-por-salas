import { z } from "zod";
import { paginacionShape } from "./comun";

/** Una sola definición de la regla: la usan el formulario (cliente) y el Route Handler (servidor). */
export const mensajeNuevoSchema = z.strictObject({
  texto: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío")
    .max(500, "El mensaje no puede pasar de 500 caracteres"),
});

export const consultaMensajesSchema = z.strictObject({
  ...paginacionShape,
  since: z.iso.datetime().optional(),
});

/** Forma de un documento de `salas/{id}/mensajes/{mid}` en Firestore. */
export const mensajeDocSchema = z.object({
  uid: z.string(),
  nombre: z.string(),
  texto: z.string(),
  creadoEn: z.string(),
});

export type MensajeDoc = z.infer<typeof mensajeDocSchema>;
export type Mensaje = MensajeDoc & { id: string };
export type MensajeNuevo = z.output<typeof mensajeNuevoSchema>;
export type ConsultaMensajes = z.output<typeof consultaMensajesSchema>;
