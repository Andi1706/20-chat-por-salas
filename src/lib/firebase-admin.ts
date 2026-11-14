import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function variable(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`);
  return valor;
}

function iniciar(): App {
  const existente = getApps()[0];
  if (existente) return existente;
  // Con el Emulator Suite no se necesita clave privada (no hay secretos reales en disco).
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return initializeApp({ projectId: variable("FIREBASE_PROJECT_ID") });
  }
  return initializeApp({
    credential: cert({
      projectId: variable("FIREBASE_PROJECT_ID"),
      clientEmail: variable("FIREBASE_CLIENT_EMAIL"),
      // En Vercel la clave llega con \n literales: se convierten en saltos de línea.
      privateKey: variable("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminAuth() {
  return getAuth(iniciar());
}

export function getDb() {
  return getFirestore(iniciar());
}
