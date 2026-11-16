/**
 * Solo se usa Firebase Auth en el navegador (para obtener el idToken).
 * Los datos NUNCA se leen desde aquí: pasan siempre por nuestra API.
 * Estas 4 variables son públicas por diseño (configuración web de Firebase).
 *
 * El SDK pesa unos 30 kB comprimidos y solo hace falta al enviar el formulario de entrada,
 * así que se descarga en ese momento (import dinámico) y no con cada página.
 */
const configuracion = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export async function authCliente() {
  const [{ getApp, getApps, initializeApp }, { getAuth }] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);
  const app = getApps().length > 0 ? getApp() : initializeApp(configuracion);
  return getAuth(app);
}
