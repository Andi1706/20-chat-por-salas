import type { MetadataRoute } from "next";
import { urlDelSitio } from "@/lib/sitio";

/** Solo la página de entrada es pública: las salas y la API no deben indexarse. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/login", disallow: ["/api/", "/salas", "/perfil"] },
    sitemap: `${urlDelSitio()}/sitemap.xml`,
  };
}
