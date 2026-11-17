import type { MetadataRoute } from "next";
import { urlDelSitio } from "@/lib/sitio";

/**
 * Solo se bloquea la API. Las salas y el perfil no necesitan bloqueo: sin sesión, el proxy
 * redirige a /login, así que un buscador nunca ve su contenido. (Si se bloquearan aquí,
 * Lighthouse marcaría esas páginas como «no indexables» y bajaría su puntaje de SEO.)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${urlDelSitio()}/sitemap.xml`,
  };
}
