import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { z } from "zod";
import { pedirApi } from "./api";
import { authCliente } from "./firebase";

/** Misma idea que en el servidor: la regla se escribe una vez y se valida antes de llamar a Firebase. */
export const credencialesSchema = z.object({
  correo: z.email("Escribe un correo válido"),
  clave: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
export type Credenciales = z.infer<typeof credencialesSchema>;

/** Convierte los códigos de Firebase en frases que una persona entiende. */
export function mensajeDeFirebase(error: unknown): string {
  const codigo = (error as { code?: string }).code ?? "";
  if (codigo === "auth/email-already-in-use") return "Ese correo ya tiene una cuenta";
  if (codigo === "auth/network-request-failed") return "No hay conexión a internet";
  if (codigo === "auth/too-many-requests") return "Demasiados intentos, espera un momento";
  if (codigo.startsWith("auth/")) return "Correo o contraseña incorrectos";
  return error instanceof Error ? error.message : "No se pudo iniciar sesión";
}

/**
 * 1) Firebase valida la contraseña y entrega un idToken.
 * 2) Nuestro servidor cambia ese idToken por una cookie HttpOnly. El token no se guarda en el navegador.
 */
export async function entrar(credenciales: Credenciales, esRegistro: boolean): Promise<void> {
  const auth = authCliente();
  const { correo, clave } = credenciales;
  const resultado = esRegistro
    ? await createUserWithEmailAndPassword(auth, correo, clave)
    : await signInWithEmailAndPassword(auth, correo, clave);
  const idToken = await resultado.user.getIdToken();
  await pedirApi("/api/auth/sesion", { metodo: "POST", cuerpo: { idToken } });
}

export async function salir(): Promise<void> {
  await pedirApi("/api/auth/sesion", { metodo: "DELETE" });
  await signOut(authCliente());
}

/** Evita redirecciones abiertas: solo se acepta una ruta interna como destino tras el login. */
export function destinoSeguro(valor: string | null): string {
  if (valor && valor.startsWith("/") && !valor.startsWith("//") && !valor.includes("\\")) {
    return valor;
  }
  return "/salas";
}
