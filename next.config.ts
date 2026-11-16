import type { NextConfig } from "next";
import { cabecerasDeSeguridad } from "./src/lib/cabeceras";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: cabecerasDeSeguridad(process.env.NODE_ENV !== "production"),
      },
    ];
  },
};

export default nextConfig;
