import Link from "next/link";
import { Vacio } from "@/components/Estados";

export default function NoEncontrada() {
  return (
    <div className="contenedor">
      <Vacio titulo="Esta página no existe">
        <Link href="/salas">Ir a las salas</Link>
      </Vacio>
    </div>
  );
}
