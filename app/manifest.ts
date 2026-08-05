import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WareBase",
    short_name: "WareBase",
    description:
      "The base layer for inventory that stays organized on its own. Real-time stock, purchasing, approvals, and warehouse control.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#151F38",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
