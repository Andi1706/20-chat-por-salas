/**
 * Cabeceras de seguridad que Next.js añade a TODAS las respuestas (ver next.config.ts).
 * Están en un archivo aparte para poder probarlas sin arrancar el servidor.
 */
export interface Cabecera {
  key: string;
  value: string;
}

/** Dominios de Google que usa el SDK de Firebase Auth desde el navegador (solo login). */
const GOOGLE_AUTH = [
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://www.googleapis.com",
];

export function construirCsp(desarrollo: boolean): string {
  const scripts = ["'self'", "'unsafe-inline'", ...(desarrollo ? ["'unsafe-eval'"] : [])];
  const reglas: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": scripts,
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...GOOGLE_AUTH, ...(desarrollo ? ["ws:", "wss:"] : [])],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
  };
  return Object.entries(reglas)
    .map(([directiva, valores]) => `${directiva} ${valores.join(" ")}`)
    .join("; ");
}

export function cabecerasDeSeguridad(desarrollo: boolean): Cabecera[] {
  return [
    { key: "Content-Security-Policy", value: construirCsp(desarrollo) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
}
