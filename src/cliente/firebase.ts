import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Solo se usa Firebase Auth en el navegador (para obtener el idToken).
 * Los datos NUNCA se leen desde aquí: pasan siempre por nuestra API.
 * Estas 4 variables son públicas por diseño (configuración web de Firebase).
 */
const configuracion = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function authCliente() {
  const app = getApps().length > 0 ? getApp() : initializeApp(configuracion);
  return getAuth(app);
}
