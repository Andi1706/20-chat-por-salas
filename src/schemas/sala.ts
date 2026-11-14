import { z } from "zod";
import { paginacionShape } from "./comun";

export const salaNuevaSchema = z.strictObject({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede pasar de 50 caracteres"),
  privada: z.boolean().default(false),
});

export const consultaSalasSchema = z.strictObject({
  ...paginacionShape,
  mias: z
    .enum(["true", "false"])
    .default("false")
    .transform((valor) => valor === "true"),
});

/** Forma de un documento de `salas/{id}` en Firestore. */
export const salaDocSchema = z.object({
  nombre: z.string(),
  creadorUid: z.string(),
  privada: z.boolean(),
  miembros: z.array(z.string()),
  creadaEn: z.string(),
});

export type SalaDoc = z.infer<typeof salaDocSchema>;
export type Sala = SalaDoc & { id: string };
export type SalaNueva = z.output<typeof salaNuevaSchema>;
export type ConsultaSalas = z.output<typeof consultaSalasSchema>;
