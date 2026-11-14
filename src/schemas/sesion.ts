import { z } from "zod";

export const sesionSchema = z.strictObject({
  idToken: z.string().min(10, "Falta el idToken"),
});
