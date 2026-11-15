import type { ReactNode } from "react";
import { MarcoSalas } from "@/components/MarcoSalas";

export default function LayoutSalas({ children }: { children: ReactNode }) {
  return <MarcoSalas>{children}</MarcoSalas>;
}
