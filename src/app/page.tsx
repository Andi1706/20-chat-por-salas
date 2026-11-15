import { redirect } from "next/navigation";

/** La portada no tiene contenido propio: lleva a las salas (el proxy pide login si hace falta). */
export default function Portada() {
  redirect("/salas");
}
