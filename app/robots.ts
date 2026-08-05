import type { MetadataRoute } from "next";

const SITE_URL = "https://warebase.getcognix.shop";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/settings", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
