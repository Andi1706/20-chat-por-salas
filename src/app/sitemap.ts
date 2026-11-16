import type { MetadataRoute } from "next";
import { urlDelSitio } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${urlDelSitio()}/login`, changeFrequency: "yearly", priority: 1 }];
}
