/** URL pública del sitio: en Vercel viene en una variable; en local se usa localhost. */
export function urlDelSitio(): string {
  const produccion = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return produccion ? `https://${produccion}` : "http://localhost:3000";
}
