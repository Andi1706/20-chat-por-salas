/**
 * Navegación con recarga completa. Se usa al entrar y al salir: en producción Next guarda en
 * memoria la respuesta que el proxy dio cuando aún no había sesión (una redirección a /login) y
 * un `router.push` la reutilizaría. Con una recarga completa el navegador pide la página de nuevo.
 */
export function irA(ruta: string): void {
  window.location.assign(ruta);
}
