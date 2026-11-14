import { z } from "zod";

export const paginacionShape = {
  limite: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).max(200).optional(),
};

export interface Pagina<T> {
  items: T[];
  siguienteCursor: string | null;
}
