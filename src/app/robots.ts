import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/legal-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal or transactional pages have no place in search results.
      disallow: ["/admin", "/account", "/checkout", "/orders", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
